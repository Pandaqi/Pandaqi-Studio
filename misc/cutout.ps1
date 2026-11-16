# cutout.ps1 — lift painted artwork off its paper/sky background, properly.
#
# A plain colour key leaves a cream halo and eats interior highlights. This tool
#   1. estimates the background colour from the image border,
#   2. flood-fills inwards from the border through colours close to it, so only
#      the connected background goes (interior cream highlights survive),
#   3. gives edge pixels a soft alpha based on colour distance,
#   4. decontaminates edges: with C = a*F + (1-a)*B it solves for F, which is
#      what actually removes the halo,
#   5. trims the transparent margin.
#
# Usage (works at any resolution, so the same call re-cuts the upscaled sheet):
#   powershell -File misc/cutout.ps1 -In ref.png -Out art.png -X 52 -Y 10 -W 38 -H 32
#   optional: -Tolerance 42 -Feather 1.6 -Trim 1

param(
    [Parameter(Mandatory=$true)][string]$In,
    [Parameter(Mandatory=$true)][string]$Out,
    [int]$X = 0,
    [int]$Y = 0,
    [int]$W = 0,
    [int]$H = 0,
    [int]$Tolerance = 42,
    [double]$Feather = 1.6,
    [int]$Erode = 0,
    [int]$Trim = 1
)

Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class PqCutoutJob
{
    private int w, h, stride, tol, erode;
    private double feather;
    private byte[] buf;
    private bool[] isBg;
    private int bgR = 245, bgG = 240, bgB = 230;
    private Queue<int> queue = new Queue<int>();

    public PqCutoutJob(Bitmap src, int tolerance, double featherAmount, int erodePixels)
    {
        w = src.Width; h = src.Height; tol = tolerance; feather = featherAmount; erode = erodePixels;
        Rectangle rect = new Rectangle(0, 0, w, h);
        BitmapData data = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        stride = data.Stride;
        buf = new byte[stride * h];
        Marshal.Copy(data.Scan0, buf, 0, buf.Length);
        src.UnlockBits(data);
        isBg = new bool[w * h];
    }

    public Bitmap Execute(bool trim)
    {
        EstimateBackground();
        FloodFromBorders();
        Dilate(erode);

        byte[] outPx = new byte[w * h * 4];
        for (int y = 0; y < h; y++)
        {
            for (int x = 0; x < w; x++)
            {
                int i = y * stride + x * 4;
                int b = buf[i], g = buf[i + 1], r = buf[i + 2], a = buf[i + 3];
                double dist = Dist(r, g, b, bgR, bgG, bgB);
                double alpha = 255.0;

                if (isBg[y * w + x]) { alpha = 0.0; }
                else if (TouchesBackground(x, y))
                {
                    // A boundary pixel is a blend of artwork and paper. Trust the
                    // colour distance over a wide band: close to paper = mostly
                    // transparent, far from paper = solid.
                    double inner = tol * 0.85;
                    double outer = tol * (1.1 + feather * 0.7);
                    double t = (dist - inner) / Math.Max(1.0, outer - inner);
                    alpha = 255.0 * Math.Max(0.0, Math.Min(1.0, t));
                }

                // Every partly transparent pixel gets its paper contamination
                // removed, which is what kills the cream halo on dark surfaces.
                if (alpha > 0.0 && alpha < 255.0 && dist < tol * 4.0)
                {
                    double af = alpha / 255.0;
                    r = Clip((r - (1.0 - af) * bgR) / af);
                    g = Clip((g - (1.0 - af) * bgG) / af);
                    b = Clip((b - (1.0 - af) * bgB) / af);
                }

                int o = (y * w + x) * 4;
                outPx[o] = (byte)b; outPx[o + 1] = (byte)g; outPx[o + 2] = (byte)r;
                outPx[o + 3] = (byte)Math.Round(alpha * (a / 255.0));
            }
        }

        int minX = 0, minY = 0, maxX = w - 1, maxY = h - 1;
        if (trim)
        {
            minX = w; minY = h; maxX = -1; maxY = -1;
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    if (outPx[(y * w + x) * 4 + 3] > 8)
                    {
                        if (x < minX) { minX = x; }
                        if (x > maxX) { maxX = x; }
                        if (y < minY) { minY = y; }
                        if (y > maxY) { maxY = y; }
                    }
                }
            }
            if (maxX < 0) { minX = 0; minY = 0; maxX = w - 1; maxY = h - 1; }
        }

        int cw = maxX - minX + 1;
        int ch = maxY - minY + 1;
        Bitmap result = new Bitmap(cw, ch, PixelFormat.Format32bppArgb);
        BitmapData rdata = result.LockBits(new Rectangle(0, 0, cw, ch), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        byte[] rbuf = new byte[rdata.Stride * ch];
        for (int y = 0; y < ch; y++)
        {
            for (int x = 0; x < cw; x++)
            {
                int si = (y + minY) * w + (x + minX);
                int di = y * rdata.Stride + x * 4;
                rbuf[di] = outPx[si * 4];
                rbuf[di + 1] = outPx[si * 4 + 1];
                rbuf[di + 2] = outPx[si * 4 + 2];
                rbuf[di + 3] = outPx[si * 4 + 3];
            }
        }
        Marshal.Copy(rbuf, 0, rdata.Scan0, rbuf.Length);
        result.UnlockBits(rdata);
        return result;
    }

    private void EstimateBackground()
    {
        Dictionary<int, int> counts = new Dictionary<int, int>();
        for (int x = 0; x < w; x++) { AddBorder(counts, x, 0); AddBorder(counts, x, h - 1); }
        for (int y = 0; y < h; y++) { AddBorder(counts, 0, y); AddBorder(counts, w - 1, y); }

        int best = 0, bestCount = -1;
        foreach (KeyValuePair<int, int> kv in counts)
        {
            if (kv.Value > bestCount) { bestCount = kv.Value; best = kv.Key; }
        }
        // The key holds 5-bit channels; rebuild a full 8-bit colour from it.
        bgR = (((best >> 16) & 0xFF) << 3) | 4;
        bgG = (((best >> 8) & 0xFF) << 3) | 4;
        bgB = ((best & 0xFF) << 3) | 4;
    }

    private void AddBorder(Dictionary<int, int> map, int x, int y)
    {
        int i = y * stride + x * 4;
        if (buf[i + 3] == 0) { return; }
        int key = ((buf[i + 2] >> 3) << 16) | ((buf[i + 1] >> 3) << 8) | (buf[i] >> 3);
        if (map.ContainsKey(key)) { map[key] = map[key] + 1; } else { map[key] = 1; }
    }

    private void Dilate(int passes)
    {
        // Painted artwork carries a light rim where it met the paper. Growing the
        // background mask inwards by a pixel drops that rim instead of tinting it.
        for (int pass = 0; pass < passes; pass++)
        {
            bool[] grown = new bool[isBg.Length];
            Array.Copy(isBg, grown, isBg.Length);
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    if (isBg[y * w + x]) { continue; }
                    if ((x > 0 && isBg[y * w + x - 1]) || (x < w - 1 && isBg[y * w + x + 1]) ||
                        (y > 0 && isBg[(y - 1) * w + x]) || (y < h - 1 && isBg[(y + 1) * w + x]))
                    {
                        grown[y * w + x] = true;
                    }
                }
            }
            isBg = grown;
        }
    }

    private void FloodFromBorders()    {
        for (int x = 0; x < w; x++) { Seed(x, 0); Seed(x, h - 1); }
        for (int y = 0; y < h; y++) { Seed(0, y); Seed(w - 1, y); }

        while (queue.Count > 0)
        {
            int p = queue.Dequeue();
            int px = p % w;
            int py = p / w;
            Seed(px - 1, py); Seed(px + 1, py); Seed(px, py - 1); Seed(px, py + 1);
        }
    }

    private void Seed(int x, int y)
    {
        if (x < 0 || y < 0 || x >= w || y >= h) { return; }
        if (isBg[y * w + x]) { return; }

        int i = y * stride + x * 4;
        if (Dist(buf[i + 2], buf[i + 1], buf[i], bgR, bgG, bgB) > tol) { return; }
        isBg[y * w + x] = true;
        queue.Enqueue(y * w + x);
    }

    private bool TouchesBackground(int x, int y)
    {
        for (int dy = -1; dy <= 1; dy++)
        {
            for (int dx = -1; dx <= 1; dx++)
            {
                int nx = x + dx;
                int ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) { return true; }
                if (isBg[ny * w + nx]) { return true; }
            }
        }
        return false;
    }

    public int BackgroundR { get { return bgR; } }
    public int BackgroundG { get { return bgG; } }
    public int BackgroundB { get { return bgB; } }

    private static int Clip(double v)
    {
        if (v < 0.0) { return 0; }
        if (v > 255.0) { return 255; }
        return (int)Math.Round(v);
    }

    private static double Dist(int r1, int g1, int b1, int r2, int g2, int b2)
    {
        double dr = r1 - r2;
        double dg = g1 - g2;
        double db = b1 - b2;
        return Math.Sqrt(dr * dr + dg * dg + db * db);
    }
}
"@

$path = (Resolve-Path $In).Path
$img = [System.Drawing.Image]::FromFile($path)
if ($W -le 0) { $W = $img.Width - $X }
if ($H -le 0) { $H = $img.Height - $Y }
$rect = New-Object System.Drawing.Rectangle($X, $Y, $W, $H)
$crop = $img.Clone($rect, $img.PixelFormat)

$job = New-Object PqCutoutJob($crop, $Tolerance, $Feather, $Erode)
$result = $job.Execute(($Trim -eq 1))

$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$result.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$kb = [math]::Round((Get-Item $Out).Length / 1024)
Write-Output ("{0}: {1}x{2}, {3} KB (bg {4},{5},{6}, tol {7}, erode {8})" -f $Out, $result.Width, $result.Height, $kb, $job.BackgroundR, $job.BackgroundG, $job.BackgroundB, $Tolerance, $Erode)

$result.Dispose(); $crop.Dispose(); $img.Dispose()
