/*Chord notation:
	Open or Closed (0 or 1), a (-1) means don't display anything
	End of guitar or another fret at the top (0 ... 12)
	First row (0 if nothing has to be displayed, otherwise the number for the finger to be displayed)
	Second Row
	Third Row
	Fourth Row
	(if there's nothing in a row, put in an empty array)
*/
/*
CHORDS Dicionary:
	Object containing String keys (full name) to every chord.
	Every key holds an array with all possible variations
		=> First element of this array is the shortened name of the chord
*/
var chords = {
	" ":["",
		[[-1,-1,-1,-1,-1,-1],0,[],[],[],[]]
	],
	/***** A ****/
	"A Major":["A",
		[[1,0,-1,-1,-1,0],0,[],[0,0,1,2,3,0],[],[]],
		[[-1,-1,-1,-1,-1,-1],5,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,4,0,0,0],[]]
	],

	"A Minor":["Am",
		[[1,0,-1,-1,-1,0],0,[0,0,0,0,1,0],[0,0,2,3,0,0],[],[]],
		[[-1,-1,-1,-1,-1,-1],5,[1,0,0,0,0,1],[],[0,3,4,0,0,0],[]]
	],

	"A Major 7th":["Amaj7",
		[[1,0,-1,-1,-1,-1],0,[],[0,0,1,0,1,0],[],[0,0,0,0,0,3]],
		[[1,0,-1,-1,-1,-1],4,[0,0,0,0,0,1],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,4,0,0,0]]
	],

	"A Minor 7th":["Am7",
		[[1,0,-1,0,-1,0],0,[0,0,0,0,1,0],[0,0,2,0,0,0],[],[]],
		[[-1,-1,-1,-1,-1,-1],5,[1,0,0,0,0,1],[],[0,4,0,0,0,0],[]]
	],

	"A Major 9th":["Amaj9",
		[[-1,-1,-1,-1,-1,1],4,[0,1,0,1,0,0],[2,0,0,0,3,0],[0,0,4,0,0,0],[]],
	],

	"A Minor 9th":["Am9",
		[[1,0,-1,-1,-1,-1],0,[0,0,0,0,1,0],[0,0,2,0,0,0],[0,0,0,0,0,3],[0,0,0,4,0,0]],
	],

	"A Added 9th":["Aadd9",
		[[1,0,-1,-1,-1,0],0,[],[0,0,1,0,2,0],[],[0,0,0,4,0,0]],
	],

	"A Suspended 2nd":["Asus2",
		[[1,0,-1,-1,0,0],0,[],[0,0,2,2,0,0],[],[]],
		[[-1,1,1,-1,-1,-1],4,[0,0,0,1,0,0],[2,0,0,0,3,4],[],[]]
	],

	"A Suspended 4th":["Asus4",
		[[1,0,-1,-1,-1,0],0,[],[0,0,1,2,0,0],[0,0,0,0,4,0],[]],
		[[1,0,-1,-1,-1,-1],5,[0,0,0,0,1,1],[],[0,0,3,4,0,0],[]]
	],

	"A Dominant 7th sus4":["A7sus4",
		[[1,0,-1,0,-1,0],0,[],[0,0,1,0,0,0],[0,0,0,0,3,0],[]],
		[[-1,-1,-1,-1,-1,-1],5,[1,0,0,0,0,1],[],[0,3,0,4,0,0],[]]
	],

	"A Major 6th":["A6",
		[[1,0,-1,-1,-1,-1],0,[],[0,0,1,0,0,1],[],[]],
		[[1,0,-1,-1,-1,-1],4,[0,0,1,0,0,0],[0,0,0,0,2,3],[0,0,0,4,0,0],[]]
	],

	"A Minor 6th":["Am6",
		[[1,0,-1,-1,-1,-1],0,[0,0,0,0,1,0],[0,0,2,3,0,4],[],[]],
		[[-1,-1,-1,-1,-1,-1],5,[1,0,0,0,0,1],[],[0,2,3,0,4,0],[]]
	],

	"A Dominant 7th":["A7",
		[[1,0,-1,0,-1,0],0,[],[0,0,1,0,3,0],[],[]],
		[[-1,-1,-1,-1,-1,-1],5,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,0,0,0,0],[]]
	],

	"A Dominant 9th":["A9",
		[[1,0,-1,-1,-1,-1],0,[],[0,0,1,0,1,0],[0,0,0,0,0,2],[0,0,0,3,0,0]],
		[[-1,-1,-1,-1,-1,1],4,[0,1,0,1,0,0],[2,0,3,0,4,0],[],[]]
	],
	/***** A# or Bb ****/
	"A# Major":["A#",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,1],[],[0,0,2,3,4,0],[]],
		[[-1,-1,-1,-1,-1,-1],6,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,4,0,0,0],[]]
	],

	"A# Minor":["A#m",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,4,0,0],[]],
		[[-1,-1,-1,-1,-1,-1],6,[1,0,0,0,0,1],[],[0,3,4,0,0,0],[]]
	],

	"A# Major 7th":["A#maj7",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,1],[0,0,0,2,0,0],[0,0,3,0,4,0],[]],
		[[1,1,-1,-1,-1,-1],5,[0,0,0,0,0,1],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,4,0,0,0]]
	],

	"A# Minor 7th":["A#m7",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[]],
		[[-1,-1,-1,-1,-1,-1],6,[1,0,0,0,0,1],[],[0,3,0,0,0,0],[]]
	],

	"A# Major 9th":["A#maj9",
		[[1,-1,0,-1,-1,-1],0,[0,1,0,0,2,3],[0,0,0,4,0,0],[],[]],
	],

	"A# Minor 9th":["A#m9",
		[[-1,-1,-1,-1,1,1],4,[0,1,0,0,0,0],[0,0,0,2,0,0],[3,0,4,0,0,0],[]],
	],

	"A# Added 9th":["Aadd9",
		[[-1,-1,-1,-1,-1,1],5,[0,1,0,1,0,0],[2,0,0,0,3,0],[],[0,0,4,0,0,0]],
	],

	"A# Suspended 2nd":["A#sus2",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,1],[],[0,0,3,4,0,0],[]],
		[[-1,-1,-1,-1,1,1],5,[0,0,0,1,0,0],[2,0,0,0,0,0],[],[0,3,3,0,0,0]]
	],

	"A# Suspended 4th":["A#sus4",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,1],[0,0,0,2,0,0],[0,0,3,0,4,0],[]],
		[[1,1,-1,-1,-1,-1],5,[0,0,0,0,0,1],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,4,0,0,0]]
	],

	"A# Dominant 7th sus4":["A#7sus4",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,1],[],[0,0,3,0,0,0],[0,0,0,0,4,0]],
		[[-1,-1,-1,-1,-1,-1],6,[1,0,0,0,0,1],[],[0,3,0,4,0,0],[]]
	],

	"A# Major 6th":["A#6",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,0],[],[0,0,3,0,0,3],[]],
		[[-1,-1,-1,-1,-1,1],5,[0,1,1,0,0,0],[2,0,0,0,3,0],[0,0,0,4,0,0],[]]
	],

	"A# Minor 6th":["A#m6",
		[[1,-1,-1,0,-1,-1],0,[0,1,0,0,0,0],[0,0,0,0,2,0],[0,0,3,0,0,4],[]],
		[[-1,-1,-1,-1,-1,-1],6,[1,0,0,0,0,1],[],[0,2,3,0,4,0],[]]
	],

	"A# Dominant 7th":["A#7",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,1],[],[0,0,3,0,4,0],[]],
		[[-1,-1,-1,-1,-1,-1],6,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,0,0,0,0],[]]
	],

	"A# Dominant 9th":["A#9",
		[[1,-1,0,-1,-1,-1],0,[0,1,0,2,3,4],[],[],[]],
		[[-1,-1,-1,-1,-1,1],5,[0,1,0,1,0,0],[2,0,3,0,4,0],[],[]]
	],
	/***** B ****/
	"B Major":["B",
		[[1,-1,-1,-1,-1,-1],0,[],[0,1,0,0,0,1],[],[0,0,2,3,4,0]],
		[[-1,-1,-1,-1,-1,-1],7,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,4,0,0,0],[]],
		[[1,-1,-1,-1,-1,-1],0,[],[0,1,0,0,0,1],[],[0,0,3,0,3,0]]
	],

	"B Minor":["Bm",
		[[1,-1,-1,-1,-1,-1],0,[],[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,4,0,0]],
		[[-1,-1,-1,-1,-1,-1],7,[1,0,0,0,0,1],[],[0,3,4,0,0,0],[]]
	],

	"B Major 7th":["Bmaj7",
		[[1,-1,-1,-1,-1,-1],0,[],[0,1,0,0,0,1],[0,0,0,2,0,0],[0,0,3,0,4,0]],
		[[1,1,-1,-1,-1,-1],6,[0,0,0,0,0,1],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,4,0,0,0]]
	],

	"B Minor 7th":["Bm7",
		[[1,-1,-1,-1,-1,-1],0,[],[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0]],
		[[-1,-1,-1,-1,-1,-1],7,[1,0,0,0,0,1],[],[0,3,0,0,0,0],[]]
	],

	"B Major 9th":["Bmaj9",
		[[1,-1,-1,-1,-1,1],0,[0,0,1,0,0,0],[0,2,0,0,3,0],[0,0,0,4,0,0],[]],
	],

	"B Minor 9th":["Bm9",
		[[1,-1,0,-1,-1,-1],0,[],[0,1,0,2,3,4],[],[]],
	],

	"B Added 9th":["Badd9",
		[[-1,-1,-1,-1,-1,1],6,[0,1,0,1,0,0],[2,0,0,0,3,0],[],[0,0,4,0,0,0]],
	],

	"B Suspended 2nd":["Bsus2",
		[[1,-1,-1,-1,-1,-1],0,[],[0,1,0,0,0,1],[],[0,0,3,4,0,0]],
		[[-1,1,1,-1,-1,-1],6,[0,0,0,1,0,0],[2,0,0,0,3,4],[],[]]
	],

	"B Suspended 4th":["Bsus4",
		[[1,-1,-1,-1,-1,-1],2,[0,1,0,0,0,1],[],[0,0,2,3,0,0],[0,0,0,0,4,0]],
		[[-1,-1,-1,-1,-1,-1],7,[1,0,0,0,0,1],[],[0,2,3,4,0,0],[]]
	],

	"B Dominant 7th sus4":["Bm7",
		[[1,-1,-1,-1,0,-1],0,[],[0,1,2,3,0,4],[],[]],
		[[1,-1,-1,-1,-1,-1],2,[0,1,0,0,0,1],[],[0,0,3,0,0,0],[0,0,0,0,4,0]]
	],

	"B Major 6th":["B6",
		[[1,-1,-1,-1,-1,-1],0,[0,1,0,0,0,0],[],[],[0,0,3,0,0,3]],
		[[-1,-1,-1,-1,-1,1],6,[0,1,1,0,0,0],[2,0,0,0,3,0],[0,0,0,4,0,0],[]]
	],

	"B Minor 6th":["Bm6",
		[[1,-1,0,-1,0,-1],0,[0,0,0,1,0,0],[0,2,0,0,0,4],[],[]],
		[[1,-1,-1,1,-1,-1],2,[0,1,0,0,0,0],[0,0,0,0,2,0],[0,0,3,0,0,4],[]]
	],

	"B Dominant 7th":["B7",
		[[1,-1,-1,-1,-1,-1],0,[],[0,1,0,0,0,1],[],[0,0,3,0,4,0]],
		[[-1,-1,-1,-1,-1,-1],7,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,0,0,0,0],[]]
	],

	"B Dominant 9th":["B9",
		[[1,-1,-1,-1,-1,-1],0,[0,0,1,0,0,0],[0,2,0,3,0,3],[],[]],
		[[-1,-1,-1,-1,-1,1],6,[0,1,0,1,0,0],[2,0,3,0,4,0],[],[]]
	],
	/***** C ****/
	"C Major":["C",
		[[1,-1,-1,0,-1,0],0,[0,0,0,0,1,0],[0,0,2,0,0,0],[0,3,0,0,0,0],[]],
		[[1,-1,-1,-1,-1,-1],3,[0,1,0,0,0,1],[],[0,0,2,3,4,0],[]]
	],

	"C Minor":["Cm",
		[[1,-1,-1,-1,-1,-1],3,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,4,0,0],[]],
		[[-1,-1,-1,-1,-1,-1],8,[1,0,0,0,0,1],[],[0,3,4,0,0,0],[]]
	],

	"C Major 7th":["Cmaj7",
		[[1,-1,-1,0,0,0],0,[],[0,0,2,0,0,0],[0,3,0,0,0,0],[]],
		[[1,-1,-1,-1,-1,-1],3,[0,1,0,0,0,1],[0,0,0,2,0,0],[0,0,3,0,4,0],[]]
	],

	"C Minor 7th":["Cm7",
		[[1,-1,-1,-1,-1,-1],3,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[]],
		[[-1,-1,-1,-1,-1,-1],8,[1,0,0,0,0,1],[],[0,3,0,0,0,0],[]]
	],

	"C Major 9th":["Cmaj9",
		[[1,-1,-1,-1,-1,-1],3,[0,1,0,0,0,1],[0,0,0,2,0,0],[0,0,3,0,0,0],[]],
		[[1,-1,-1,-1,-1,0],0,[],[0,0,1,0,0,0],[0,2,0,0,3,0],[0,0,0,4,0,0]]
	],

	"C Minor 9th":["Cm9",
		[[-1,-1,-1,-1,1,1],6,[0,1,0,0,0,0],[0,0,0,2,0,0],[3,0,4,0,0,0],[]],
	],

	"C Added 9th":["Cadd9",
		[[1,-1,-1,0,-1,-1],0,[],[0,0,1,0,0,0],[0,2,0,0,3,4],[]],
	],

	"C Suspended 2nd":["Csus2",
		[[1,-1,0,0,-1,-1],0,[0,0,0,0,1,0],[],[0,3,0,0,0,4],[]],
		[[1,-1,-1,-1,-1,-1],3,[0,1,0,0,0,1],[],[0,0,3,4,0,0],[]]
	],

	"C Suspended 4th":["Csus4",
		[[1,-1,-1,0,-1,-1],0,[0,0,0,0,1,1],[],[0,3,4,0,0,0],[]],
		[[1,-1,-1,-1,-1,-1],3,[0,1,0,0,0,1],[],[0,0,2,3,0,0],[0,0,0,0,4,0]]
	],

	"C Dominant 7th sus4":["C7sus4",
		[[1,-1,-1,-1,1,-1],3,[0,1,2,3,0,4],[],[],[]],
		[[1,-1,-1,-1,-1,-1],3,[0,1,0,0,0,1],[],[0,0,3,0,0,0],[0,0,0,0,4,0]]
	],

	"C Major 6th":["C6",
		[[1,-1,-1,-1,-1,0],0,[0,0,0,0,1,0],[0,0,2,3,0,0],[0,4,0,0,0,0],[]],
		[[1,-1,-1,-1,-1,-1],3,[0,1,0,0,0,0],[],[0,0,3,0,0,3],[]],
		[[0,0,-1,0,-1,-1],0,[0,0,0,0,1,0],[0,0,2,0,0,0],[0,0,0,0,0,4],[]],
		[[-1,-1,-1,-1,-1,0],7,[0,1,1,0,0,0],[2,0,0,0,3,0],[0,0,0,4,0,0],[]]
	],

	"C Minor 6th":["Cm6",
		[[1,-1,-1,-1,-1,-1],0,[0,0,1,0,1,0],[0,0,0,2,0,0],[0,3,0,0,0,4],[]],
		[[1,-1,-1,1,-1,-1],3,[0,1,0,0,0,0],[0,0,0,0,2,0],[0,0,3,0,0,4],[]]
	],

	"C Dominant 7th":["C7",
		[[1,-1,-1,-1,-1,0],0,[0,0,0,0,1,0],[0,0,2,0,0,0],[0,3,0,4,0,0],[]],
		[[1,-1,-1,1,-1,-1],3,[0,1,0,0,0,1],[],[0,0,3,0,4,0],[]]
	],

	"C Dominant 9th":["C9",
		[[1,-1,-1,-1,-1,-1],0,[],[0,0,1,0,0,0],[0,2,0,3,0,3],[]],
		[[-1,-1,-1,1,-1,0],7,[0,1,0,1,0,0],[2,0,3,0,4,0],[],[]]
	],
	/***** C# or Db ****/
	"C# Major":["C#",
		[[1,-1,-1,-1,-1,-1],0,[0,0,0,1,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[0,4,0,0,0,0]],
		[[1,-1,-1,-1,-1,-1],4,[0,1,0,0,0,1],[],[0,0,2,3,4,0],[]]
	],

	"C# Minor":["C#m",
		[[1,-1,-1,-1,-1,-1],4,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,4,0,0],[]],
		[[-1,-1,-1,-1,-1,-1],9,[1,0,0,0,0,1],[],[0,3,4,0,0,0],[]]
	],

	"C# Major 7th":["C#maj7",
		[[1,-1,-1,-1,-1,-1],0,[0,0,0,1,0,1],[],[0,0,3,0,0,0],[0,4,0,0,0,0]],
		[[1,-1,-1,-1,-1,-1],4,[0,1,0,0,0,1],[0,0,0,2,0,0],[0,0,3,0,4,0],[]]
	],

	"C# Minor 7th":["C#m7",
		[[1,-1,-1,-1,-1,-1],2,[0,0,1,0,1,0],[],[0,2,0,3,0,4],[]],
		[[1,-1,-1,-1,-1,-1],4,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[]]
	],

	"C# Major 9th":["C#maj9",
		[[1,-1,-1,-1,-1,1],3,[0,0,1,0,0,0],[0,2,0,0,3,0],[0,0,0,4,0,0],[]],
	],

	"C# Minor 9th":["C#m9",
		[[-1,-1,-1,-1,1,1],7,[0,1,0,0,0,0],[0,0,0,2,0,0],[3,0,5,0,0,0],[]],
	],

	"C# Added 9th":["C#add9",
		[[1,-1,-1,-1,-1,1],0,[0,1,0,0,0,0],[],[0,0,2,0,0,0],[0,3,0,0,4,0]],
	],

	"C# Suspended 2nd":["C#sus2",
		[[1,-1,-1,-1,-1,-1],0,[0,0,1,0,0,1],[0,0,0,0,2,0],[],[0,3,0,0,0,4]],
		[[1,-1,-1,-1,-1,1],4,[0,1,0,0,0,1],[],[0,0,3,4,0,0],[]]
	],

	"C# Suspended 4th":["C#sus4",
		[[1,-1,-1,-1,-1,-1],4,[0,1,0,0,0,1],[],[0,0,2,3,0,0],[0,0,0,0,4,0]],
		[[-1,-1,-1,-1,-1,1],6,[0,0,1,1,0,0],[0,0,0,0,2,0],[],[3,4,0,0,0,0]]
	],

	"C# Dominant 7th sus4":["C#7sus4",
		[[1,-1,-1,-1,1,-1],4,[0,1,2,3,0,4],[],[],[]],
		[[1,-1,-1,-1,-1,-1],4,[0,1,0,0,0,1],[],[0,0,3,0,0,0],[0,0,0,0,4,0]]
	],

	"C# Major 6th":["C#6",
		[[1,-1,-1,-1,-1,-1],4,[0,1,0,0,0,0],[],[0,0,3,0,0,3],[]],
		[[-1,-1,-1,-1,-1,1],8,[0,1,1,0,0,0],[2,0,0,0,3,0],[0,0,0,4,0,0],[]]
	],

	"C# Minor 6th":["C#m6",
		[[1,-1,-1,-1,-1,-1],0,[],[0,0,1,0,1,0],[0,0,0,2,0,0],[0,3,0,0,0,4]],
		[[1,-1,-1,1,-1,-1],4,[0,1,0,0,0,0],[0,0,0,0,2,0],[0,0,3,0,0,4],[]]
	],

	"C# Dominant 7th":["C#7",
		[[1,-1,-1,-1,-1,1],0,[],[0,0,0,0,1,0],[0,0,2,0,0,0],[0,3,0,4,0,0]],
		[[1,-1,-1,1,-1,-1],4,[0,1,0,0,0,1],[],[0,0,3,0,4,0],[]]
	],

	"C# Dominant 9th":["C#9",
		[[1,-1,-1,-1,-1,-1],3,[0,0,1,0,0,0],[0,2,0,3,0,3],[],[]],
		[[-1,-1,-1,-1,-1,1],8,[0,1,0,1,0,0],[2,0,3,0,4,0],[],[]]
	],
	/***** D ****/
	"D Major":["D",
		[[1,1,0,-1,-1,-1],0,[],[0,0,0,1,0,2],[0,0,0,0,3,0],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,1],[],[0,0,2,3,4,0],[]]
	],

	"D Minor":["Dm",
		[[1,1,0,-1,-1,-1],0,[0,0,0,0,0,1],[0,0,0,2,0,0],[0,0,0,0,3,0],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,4,0,0],[]]
	],

	"D Major 7th":["Dmaj7",
		[[1,1,0,-1,-1,-1],0,[],[0,0,0,1,0,2],[0,0,0,0,3,0],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,1],[],[0,0,2,3,4,0],[]]
	],

	"D Minor 7th":["Dm7",
		[[1,1,0,-1,-1,-1],0,[0,0,0,0,1,1],[0,0,0,2,0,0],[],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[]]
	],

	"D Major 9th":["Dmaj9",
		[[1,1,0,-1,-1,0],0,[],[0,0,0,1,2,0],[],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,1],[0,0,0,2,0,0],[0,0,3,0,0,0],[]],
		[[1,-1,-1,-1,-1,1],4,[0,0,1,0,0,0],[0,2,0,0,3,0],[0,0,0,4,0,0],[]]
	],

	"D Minor 9th":["Dm9",
		[[1,-1,-1,-1,-1,0],3,[0,0,1,0,0,0],[],[0,2,0,3,4,0],[]],
	],

	"D Added 9th":["Dadd9",
		[[1,-1,-1,-1,-1,-1],2,[0,0,0,1,0,0],[],[0,0,2,0,0,0],[0,3,0,0,4,0]],
	],

	"D Suspended 2nd":["Dsus2",
		[[1,1,0,-1,-1,0],0,[],[0,0,0,1,0,0],[0,0,0,0,3,0],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,1],[],[0,0,3,4,0,0],[]]
	],

	"D Suspended 4th":["Dsus4",
		[[1,1,0,-1,-1,-1],0,[],[0,0,0,1,0,0],[0,0,0,0,3,4],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,1],[],[0,0,2,3,0,0],[0,0,0,0,4,0]]
	],

	"D Dominant 7th sus4":["D7sus4",
		[[1,1,0,-1,-1,-1],0,[0,0,0,0,1,0],[0,0,0,2,0,0],[0,0,0,0,0,3],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,1],[],[0,0,3,0,0,0],[0,0,0,0,4,0]]
	],

	"D Major 6th":["D6",
		[[1,1,0,-1,0,-1],0,[],[0,0,0,1,0,2],[],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,0],[],[0,0,3,0,0,3],[]]
	],

	"D Minor 6th":["Dm6",
		[[1,1,0,-1,-1,-1],0,[0,0,0,0,0,1],[0,0,0,2,0,0],[],[]],
		[[1,-1,-1,-1,-1,-1],3,[0,0,1,0,1,0],[0,0,0,2,0,0],[0,3,0,0,0,4],[]]
	],

	"D Dominant 7th":["D7",
		[[1,1,0,-1,-1,-1],0,[0,0,0,0,1,0],[0,0,0,2,0,3],[],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,1],[],[0,0,3,0,4,0],[]]
	],

	"D Dominant 9th":["D9",
		[[1,-1,-1,-1,-1,-1],4,[0,0,1,0,0,0],[0,2,0,3,0,3],[],[]],
		[[-1,-1,-1,-1,-1,1],9,[0,1,0,1,0,0],[2,0,3,0,4,0],[],[]]
	],
	/***** D# or Eb ****/
	"D# Major":["D#",
		[[1,-1,-1,-1,-1,-1],3,[0,0,0,1,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[0,4,0,0,0,0]],
		[[1,-1,-1,-1,-1,-1],6,[0,1,0,0,0,1],[],[0,0,2,3,4,0],[]]
	],

	"D# Minor":["D#m",
		[[1,1,-1,-1,-1,-1],0,[0,0,1,0,0,0],[0,0,0,0,0,2],[0,0,0,3,0,0],[0,0,0,0,4,0]],
		[[1,-1,-1,-1,-1,-1],6,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,4,0,0],[]]
	],

	"D# Major 7th":["D#maj7",
		[[1,-1,-1,-1,-1,-1],3,[0,0,0,1,0,1],[],[0,0,3,0,0,0],[0,4,0,0,0,0]],
		[[1,-1,-1,-1,-1,-1],6,[0,1,0,0,0,1],[0,0,0,2,0,0],[0,0,3,0,4,0],[]]
	],

	"D# Minor 7th":["D#m7",
		[[1,-1,-1,-1,-1,-1],4,[0,0,1,0,1,0],[],[0,2,0,3,0,4],[]],
		[[1,-1,-1,-1,-1,-1],6,[0,1,0,0,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[]]
	],

	"D# Major 9th":["D#maj9",
		[[1,-1,-1,-1,-1,1],5,[0,0,1,0,0,0],[0,2,0,0,3,0],[0,0,0,4,0,0],[]],
	],

	"D# Minor 9th":["D#m9",
		[[1,-1,-1,-1,-1,1],4,[0,0,1,0,0,0],[],[0,2,0,3,4,0],[]],
	],

	"D# Added 9th":["D#add9",
		[[1,-1,-1,-1,-1,1],3,[0,0,0,1,0,0],[],[0,0,2,0,0,0],[0,3,0,0,4,0]],
	],

	"D# Suspended 2nd":["D#sus2",
		[[1,1,-1,-1,-1,1],0,[0,0,1,0,0,1],[],[0,0,0,3,0,0],[0,0,0,0,4,0]],
		[[1,-1,-1,-1,-1,-1],6,[0,1,0,0,0,1],[],[0,0,3,4,0,0],[]]
	],

	"D# Suspended 4th":["D#sus4",
		[[1,-1,-1,-1,-1,1],3,[0,0,0,1,0,0],[0,0,0,0,2,0],[],[0,3,4,0,0,0]],
		[[1,-1,-1,-1,-1,-1],6,[0,1,0,0,0,1],[],[0,0,2,3,0,0],[0,0,0,0,4,0]]
	],

	"D# Dominant 7th sus4":["D#7sus4",
		[[1,1,-1,-1,-1,-1],0,[0,0,1,0,0,0],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,0,0,0,4]],
		[[1,-1,-1,-1,-1,-1],6,[0,1,0,0,0,1],[],[0,0,3,0,0,0],[0,0,0,0,4,0]]
	],

	"D# Major 6th":["D#6",
		[[1,1,-1,-1,-1,-1],0,[0,0,1,0,1,0],[],[0,0,0,3,0,4],[]],
		[[1,-1,-1,-1,-1,-1],6,[0,1,0,0,0,0],[],[0,0,3,0,0,3],[]]
	],

	"D# Minor 6th":["D#m6",
		[[1,-1,-1,-1,-1,-1],4,[0,0,1,0,1,0],[0,0,0,2,0,0],[0,3,0,0,4,0],[]],
		[[1,-1,-1,1,-1,-1],6,[0,1,0,0,0,0],[0,0,0,0,2,0],[0,0,3,0,0,4],[]]
	],

	"D# Dominant 7th":["D#7",
		[[1,-1,-1,-1,-1,1],4,[0,0,0,0,1,0],[0,0,2,0,0,0],[0,3,0,4,0,0],[]],
		[[1,-1,-1,-1,-1,-1],6,[0,1,0,0,0,1],[],[0,0,3,0,4,0],[]]
	],

	"D# Dominant 9th":["D#9",
		[[1,1,-1,0,-1,1],0,[0,0,1,0,0,2],[0,0,0,0,3,0],[],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,1,0,0,0,0],[0,2,0,3,0,3],[],[]]
	],
	/***** E ****/
	"E Major":["E",
		[[0,-1,-1,-1,0,0],0,[0,0,0,1,0,0],[0,2,3,0,0,0],[],[]],
		[[1,-1,-1,-1,-1,-1],4,[0,0,0,1,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[0,4,0,0,0,0]]
	],

	"E Minor":["Em",
		[[0,-1,-1,0,0,0],0,[],[0,2,3,0,0,0],[],[]],
		[[1,1,-1,-1,-1,-1],2,[0,0,1,0,0,0],[0,0,0,0,0,2],[0,0,0,3,0,0],[0,0,0,0,4,0]]
	],

	"E Major 7th":["Emaj7",
		[[0,-1,-1,-1,0,0],0,[0,0,1,2,0,0],[0,3,0,0,0,0],[],[]],
		[[1,1,-1,-1,-1,-1],2,[0,0,1,0,0,0],[],[0,0,0,4,0,4],[]]
	],

	"E Minor 7th":["Em7",
		[[0,-1,-1,0,-1,0],0,[],[0,2,3,0,0,0],[0,0,0,0,4,0],[]],
		[[0,-1,-1,-1,-1,-1],0,[],[0,1,1,0,0,0],[0,0,0,0,2,3],[0,0,0,4,0,0]]
	],

	"E Major 9th":["Emaj9",
		[[0,-1,-1,-1,0,-1],0,[0,0,1,2,0,0],[0,3,0,0,0,4],[],[]],
	],

	"E Minor 9th":["Em9",
		[[0,-1,-1,0,-1,-1],0,[],[0,1,2,0,0,3],[0,0,0,0,4,0],[]],
	],

	"E Added 9th":["Eadd9",
		[[0,-1,-1,-1,0,-1],0,[0,0,0,1,0,0],[0,2,3,0,0,4],[],[]],
	],

	"E Suspended 2nd":["Esus2",
		[[0,-1,-1,-1,0,0],0,[],[0,2,3,4,0,0],[],[]],
		[[1,-1,-1,-1,-1,0],4,[0,0,0,1,0,0],[0,0,0,0,2,0],[],[0,3,4,0,0,0]]
	],

	"E Suspended 4th":["Esus4",
		[[1,1,-1,-1,-1,-1],1,[0,0,1,0,0,1],[],[0,0,0,3,0,0],[0,0,0,0,4,0]],
		[[0,-1,-1,-1,-1,-1],7,[0,1,0,0,0,1],[],[0,0,3,4,0,0],[]]
	],

	"E Dominant 7th sus4":["E7sus4",
		[[0,-1,0,-1,0,0],0,[],[0,2,0,3,0,0],[],[]],
		[[1,1,-1,-1,-1,-1],2,[0,0,1,0,0,0],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,0,0,0,4]]
	],

	"E Major 6th":["E6",
		[[0,-1,-1,-1,-1,0],0,[0,0,0,1,0,0],[0,2,3,0,4,0],[],[]],
		[[1,-1,-1,-1,-1,-1],0,[],[0,1,0,0,1,0],[],[0,0,0,3,0,4]]
	],

	"E Minor 6th":["Em6",
		[[0,-1,-1,0,-1,0],0,[],[0,2,3,0,4,0],[],[]],
		[[0,-1,-1,-1,-1,-1],5,[0,0,1,0,1,0],[0,0,0,2,0,0],[0,3,0,0,0,4],[]]
	],

	"E Dominant 7th":["E7",
		[[0,-1,0,-1,-1,0],0,[0,0,0,1,0,0],[0,2,0,0,0,0],[0,0,0,0,4,0],[]],
		[[0,-1,-1,-1,-1,0],5,[0,0,0,0,1,0],[0,0,2,0,0,0],[0,3,0,4,0,0],[]]
	],

	"E Dominant 9th":["E9",
		[[0,-1,0,-1,-1,-1],0,[0,0,0,1,0,0],[0,2,0,0,0,3],[0,0,0,0,4,0],[]],
		[[0,-1,-1,-1,-1,-1],6,[0,0,1,0,0,0],[0,2,0,3,0,3],[],[]]
	],
	/***** F ****/
	"F Major":["F",
		[[1,1,-1,-1,-1,-1],0,[0,0,0,0,1,1],[0,0,0,2,0,0],[0,0,3,0,0,0],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,0,0,1,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[0,4,0,0,0,0]]
	],

	"F Minor":["Fm",
		[[-1,-1,-1,-1,-1,-1],0,[1,0,0,0,0,1],[],[0,3,4,0,0,0],[]],
		[[1,1,-1,-1,-1,-1],3,[0,0,1,0,0,0],[0,0,0,0,0,2],[0,0,0,3,0,0],[0,0,0,0,4,0]]
	],

	"F Major 7th":["Fmaj7",
		[[1,1,-1,-1,-1,0],0,[0,0,0,0,1,0],[0,0,0,2,0,0],[0,0,3,0,0,0],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,0,0,1,0,1],[],[0,0,3,0,0,0],[0,4,0,0,0,0]]
	],

	"F Minor 7th":["Fm7",
		[[-1,-1,-1,-1,-1,-1],0,[1,0,0,0,0,1],[],[0,2,3,0,0,0],[0,0,0,0,4,0]],
		[[1,1,-1,-1,-1,-1],3,[0,0,1,0,0,0],[0,0,0,0,2,3],[0,0,0,4,0,0],[]]
	],

	"F Major 9th":["Fmaj9",
		[[-1,0,-1,0,-1,0],0,[1,0,0,0,2,0],[0,0,3,0,0,0],[],[]],
	],

	"F Minor 9th":["Fm9",
		[[-1,-1,-1,-1,-1,-1],0,[1,0,0,0,1,0],[],[0,3,0,0,0,4],[]],
	],

	"F Added 9th":["Fadd9",
		[[1,1,-1,-1,-1,-1],0,[0,0,0,0,1,0],[0,0,0,2,0,0],[0,0,3,0,0,4],[]],
	],

	"F Suspended 2nd":["Fsus2",
		[[1,1,-1,0,-1,-1],0,[0,0,0,0,1,1],[],[0,0,3,0,0,0],[]],
		[[1,1,-1,-1,-1,-1],2,[0,0,1,0,0,1],[],[0,0,0,3,0,0],[0,0,0,0,4,0]],
		[[1,-1,-1,-1,-1,-1],8,[0,1,0,0,0,1],[],[0,0,3,4,0,0],[]]
	],

	"F Suspended 4th":["Fsus4",
		[[-1,-1,-1,-1,-1,-1],0,[1,0,0,0,0,1],[],[0,0,2,3,0,0],[]],
		[[1,-1,-1,-1,-1,-1],5,[0,0,0,1,0,0],[0,0,0,0,2,0],[],[0,3,4,0,0,0]]
	],

	"F Dominant 7th sus4":["F7sus4",
		[[-1,-1,-1,-1,-1,-1],0,[1,0,0,0,0,1],[],[0,2,0,3,0,0],[]],
		[[1,1,-1,-1,-1,-1],3,[0,0,1,0,0,0],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,0,0,0,4]]
	],

	"F Major 6th":["F6",
		[[-1,0,0,-1,-1,-1],0,[1,0,0,0,2,3],[0,0,0,4,0,0],[],[]],
		[[1,1,-1,-1,-1,-1],3,[0,0,1,0,1,0],[],[0,0,0,3,0,4],[]]
	],

	"F Minor 6th":["Fm6",
		[[-1,-1,-1,-1,-1,-1],0,[1,0,0,0,0,1],[],[0,2,3,0,4,0],[]],
		[[1,-1,-1,-1,-1,-1],6,[0,0,1,0,1,0],[0,0,0,2,0,0],[0,3,0,0,0,4],[]]
	],

	"F Dominant 7th":["F7",
		[[-1,-1,-1,-1,-1,-1],0,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,0,0,0,0],[]],
		[[1,-1,-1,-1,-1,1],6,[0,0,0,0,1,0],[0,0,2,0,0,0],[0,3,0,4,0,0],[]]
	],

	"F Dominant 9th":["F9",
		[[-1,0,-1,0,-1,-1],0,[1,0,2,0,3,4],[],[],[]],
		[[1,1,-1,-1,-1,-1],0,[],[0,0,0,1,0,0],[0,0,2,0,0,3],[0,0,0,0,4,0]]
	],
	/***** F# or Gb ****/
	"F# Major":["F#",
		[[1,1,-1,-1,-1,-1],0,[],[0,0,0,0,1,1],[0,0,0,2,0,0],[0,0,3,0,0,0]],
		[[1,-1,-1,-1,-1,-1],6,[0,0,0,1,0,1],[0,0,0,0,2,0],[0,0,3,0,0,0],[0,4,0,0,0,0]]
	],

	"F# Minor":["F#m",
		[[-1,-1,-1,-1,-1,-1],0,[],[1,0,0,0,0,1],[],[0,3,4,0,0,0]],
		[[1,1,-1,-1,-1,-1],4,[0,0,1,0,0,0],[0,0,0,0,0,2],[0,0,0,3,0,0],[0,0,0,0,4,0]]
	],

	"F# Major 7th":["F#maj7",
		[[-1,-1,-1,-1,-1,1],0,[],[1,0,0,0,1,0],[0,0,2,3,0,0],[0,4,0,0,0,0]],
		[[1,-1,-1,-1,-1,-1],6,[0,0,0,1,0,1],[],[0,0,3,0,0,0],[0,4,0,0,0,0]]
	],

	"F# Minor 7th":["F#m7",
		[[-1,-1,-1,-1,-1,-1],2,[1,0,0,0,0,1],[],[0,2,3,0,0,0],[0,0,0,0,4,0]],
		[[1,1,-1,-1,-1,-1],4,[0,0,1,0,0,0],[0,0,0,0,2,3],[0,0,0,4,0,0],[]]
	],

	"F# Major 9th":["F#maj9",
		[[-1,-1,-1,-1,-1,1],0,[0,1,0,1,0,0],[2,0,0,0,3,0],[0,0,4,0,0,0],[]],
	],

	"F# Minor 9th":["F#m9",
		[[-1,-1,-1,-1,-1,-1],0,[],[1,0,0,0,1,0],[],[0,3,0,0,0,4]],
	],

	"F# Added 9th":["F#9",
		[[1,1,-1,-1,-1,-1],2,[0,0,0,0,1,0],[0,0,0,2,0,0],[0,0,3,0,0,4],[]],
	],

	"F# Suspended 2nd":["F#sus2",
		[[1,1,-1,-1,-1,-1],4,[0,0,1,0,0,1],[],[0,0,0,3,0,0],[0,0,0,0,4,0]],
		[[1,-1,-1,-1,-1,-1],9,[0,1,0,0,0,1],[],[0,0,3,4,0,0],[]]
	],

	"F# Suspended 4th":["F#sus4",
		[[-1,-1,-1,-1,-1,-1],0,[],[1,0,0,0,0,1],[],[0,0,2,3,0,0]],
		[[1,-1,-1,-1,-1,1],6,[0,0,0,1,0,0],[0,0,0,0,2,0],[],[0,3,4,0,0,0]]
	],

	"F# Dominant 7th sus4":["F#7sus4",
		[[-1,-1,-1,-1,-1,-1],0,[],[1,0,0,0,0,1],[],[0,2,0,3,0,0]],
		[[1,1,-1,-1,-1,-1],4,[0,0,1,0,0,0],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,0,0,0,4]]
	],

	"F# Major 6th":["F#6",
		[[-1,-1,-1,-1,-1,1],0,[0,1,1,0,0,0],[2,0,0,0,3,0],[0,0,0,4,0,0],[]],
		[[1,1,-1,-1,-1,1],4,[0,0,1,0,1,0],[],[0,0,0,3,0,4],[]]
	],

	"F# Minor 6th":["F#m6",
		[[-1,-1,-1,-1,-1,-1],0,[],[1,0,0,0,0,1],[],[0,2,3,0,4,0]],
		[[1,-1,-1,-1,-1,-1],7,[0,0,1,0,1,0],[0,0,0,2,0,0],[0,3,0,0,0,4],[]]
	],

	"F# Dominant 7th":["F#7",
		[[-1,-1,-1,-1,-1,-1],0,[],[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,0,0,0,0]],
		[[1,-1,-1,-1,-1,1],7,[0,0,0,0,1,0],[0,0,2,0,0,0],[0,3,0,4,0,0],[]]
	],

	"F# Dominant 9th":["F#9",
		[[-1,-1,-1,-1,-1,-1],0,[0,1,0,1,0,0],[2,0,3,0,4,0],[],[]],
		[[1,1,-1,-1,-1,1],3,[0,0,0,1,0,0],[0,0,2,0,0,3],[0,0,0,0,4,0],[]]
	],
	/***** G ****/
	"G Major":["G",
		[[-1,-1,0,0,0,-1],0,[],[0,1,0,0,0,0],[2,0,0,0,0,3],[]],
		[[-1,-1,0,0,0,-1],0,[],[0,1,0,0,0,0],[2,0,0,0,3,4],[]],
		[[-1,-1,-1,-1,-1,-1],3,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,4,0,0,0],[]]
	],

	"G Minor":["Gm",
		[[-1,-1,-1,-1,-1,-1],3,[1,0,0,0,0,1],[],[0,3,4,0,0,0],[]],
		[[1,1,-1,-1,-1,-1],5,[0,0,1,0,0,0],[0,0,0,0,0,2],[0,0,0,3,0,0],[0,0,0,0,4,0]]
	],

	"G Major 7th":["Gmaj7",
		[[1,1,-1,-1,-1,-1],2,[0,0,0,0,0,1],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,4,0,0,0]],
		[[1,-1,-1,-1,-1,-1],7,[0,0,0,1,0,1],[],[0,0,3,0,0,0],[0,4,0,0,0,0]]
	],

	"G Minor 7th":["Gm7",
		[[-1,-1,-1,-1,-1,-1],3,[1,0,0,0,0,1],[],[0,2,3,0,0,0],[0,0,0,0,4,0]],
		[[1,1,-1,-1,-1,-1],5,[0,0,1,0,0,0],[0,0,0,0,2,3],[0,0,0,4,0,0],[]]
	],

	"G Major 9th":["Gmaj9",
		[[-1,-1,-1,-1,-1,1],0,[],[0,1,0,1,0,0],[2,0,0,0,3,0],[0,0,4,0,0,0]],
	],

	"G Minor 9th":["Gm9",
		[[-1,-1,-1,-1,1,1],0,[0,1,0,0,0,0],[0,0,0,2,0,0],[3,0,4,0,0,0],[]],
	],

	"G Added 9th":["Gadd9",
		[[-1,1,0,-1,0,-1],0,[],[0,0,0,1,0,0],[2,0,0,0,0,3],[]],
	],

	"G Suspended 2nd":["Gsus2",
		[[-1,0,0,0,-1,-1],0,[],[],[2,0,0,0,3,4],[]],
		[[-1,0,0,-1,-1,-1],0,[],[0,0,0,1,0,0],[2,0,0,0,3,4],[]],
		[[1,-1,-1,-1,-1,-1],10,[0,1,0,0,0,1],[],[0,0,3,4,0,0],[]],
		[[1,1,-1,-1,-1,-1],5,[0,0,1,0,0,1],[],[0,0,0,3,0,0],[0,0,0,0,4,0]]
	],

	"G Suspended 4th":["Gsus4",
		[[-1,1,0,0,-1,-1],0,[0,0,0,0,1,0],[],[3,0,0,0,0,4],[]],
		[[-1,-1,-1,-1,-1,-1],3,[1,0,0,0,0,1],[],[0,2,3,4,0,0],[]]
	],

	"G Dominant 7th sus4":["G7sus4",
		[[-1,-1,0,0,-1,-1],0,[0,0,0,0,1,1],[],[3,4,0,0,0,0],[]],
		[[-1,-1,-1,-1,-1,-1],3,[1,0,0,0,0,1],[],[0,2,0,3,0,0],[]]
	],

	"G Major 6th":["G6",
		[[-1,1,0,0,0,0],0,[],[0,2,0,0,0,0],[3,0,0,0,0,0],[]],
		[[-1,-1,-1,-1,-1,0],0,[],[0,1,1,0,0,0],[2,0,0,0,3,0],[0,0,0,4,0,0]]
	],

	"G Minor 6th":["Gm6",
		[[-1,-1,-1,-1,-1,-1],3,[1,0,0,0,0,1],[],[0,2,3,0,4,0],[]],
		[[1,-1,-1,-1,-1,-1],8,[0,0,1,0,1,0],[0,0,0,2,0,0],[0,3,0,0,0,4],[]]
	],

	"G Dominant 7th":["G7",
		[[-1,-1,0,0,0,-1],0,[0,0,0,0,0,1],[0,2,0,0,0,0],[3,0,0,0,0,0],[]],
		[[-1,-1,-1,-1,-1,-1],3,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,0,0,0,0],[]]
	],

	"G Dominant 9th":["G9",
		[[-1,-1,-1,-1,-1,1],0,[],[0,1,0,1,0,0],[2,0,3,0,4,0],[]],
		[[1,1,-1,-1,-1,-1],4,[0,0,0,1,0,0],[0,0,2,0,0,3],[0,0,0,0,4,0],[]]
	],
	/***** G# or Ab ****/
	"G# Major":["G#",
		[[-1,-1,-1,-1,-1,-1],0,[0,0,1,0,1,0],[],[0,2,0,0,0,0],[3,0,0,0,0,4]],
		[[-1,-1,-1,-1,-1,-1],4,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,4,0,0,0],[]]
	],

	"G# Minor":["G#m",
		[[-1,-1,-1,-1,-1,-1],4,[1,0,0,0,0,1],[],[0,3,4,0,0,0],[]],
		[[1,1,-1,-1,-1,-1],6,[0,0,1,0,0,0],[0,0,0,0,0,2],[0,0,0,3,0,0],[0,0,0,0,4,0]]
	],

	"G# Major 7th":["G#maj7",
		[[1,1,-1,-1,-1,-1],3,[0,0,0,0,0,1],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,4,0,0,0]],
		[[-1,1,-1,-1,-1,1],4,[1,0,0,0,2,0],[0,0,3,4,0,0],[],[]]
	],

	"G# Minor 7th":["G#m7",
		[[-1,-1,-1,-1,-1,-1],4,[1,0,0,0,0,1],[],[0,2,3,0,0,0],[0,0,0,0,4,0]],
		[[1,1,-1,-1,-1,-1],6,[0,0,1,0,0,0],[0,0,0,0,2,3],[0,0,0,4,0,0],[]]
	],

	"G# Major 9th":["G#maj9",
		[[-1,-1,-1,-1,-1,1],3,[0,1,0,1,0,0],[2,0,0,0,3,0],[0,0,4,0,0,0],[]],
	],

	"G# Minor 9th":["G#m9",
		[[-1,-1,-1,-1,-1,-1],4,[1,0,0,0,1,0],[],[0,3,0,0,0,4],[]],
	],

	"G# Added 9th":["G#add9",
		[[-1,1,-1,-1,-1,-1],0,[0,0,1,0,1,0],[],[0,0,0,2,0,0],[3,0,0,0,0,4]],
	],

	"G# Suspended 2nd":["G#sus2",
		[[1,1,-1,-1,-1,-1],6,[0,0,1,0,0,1],[],[0,0,0,3,0,0],[0,0,0,0,4,0]]
	],

	"G# Suspended 4th":["G#sus4",
		[[-1,-1,-1,-1,1,1],0,[0,0,1,1,0,0],[],[],[3,4,0,0,0,0]],
		[[-1,-1,-1,-1,-1,-1],4,[1,0,0,0,0,1],[],[0,2,3,4,0,0],[]]
	],

	"G# Dominant 7th sus4":["G#7sus4",
		[[-1,-1,-1,-1,-1,-1],4,[1,0,0,0,0,1],[],[0,2,0,3,0,0],[]],
		[[1,1,-1,-1,-1,-1],6,[0,0,1,0,0,0],[0,0,0,0,2,0],[0,0,0,3,0,0],[0,0,0,0,0,4]]
	],

	"G# Major 6th":["G#6",
		[[-1,-1,-1,-1,-1,-1],0,[0,0,1,0,0,1],[],[0,3,0,0,0,0],[4,0,0,0,0,0]],
		[[-1,-1,-1,-1,-1,1],3,[0,1,1,0,0,0],[2,0,0,0,3,0],[0,0,0,4,0,0],[]]
	],

	"G# Minor 6th":["G#m6",
		[[-1,1,-1,-1,-1,1],0,[],[],[0,0,1,0,0,0],[2,0,0,3,4,0]],
		[[-1,-1,-1,-1,-1,-1],4,[1,0,0,0,0,1],[],[0,2,3,0,4,0],[]]
	],

	"G# Dominant 7th":["G#7",
		[[-1,-1,-1,-1,-1,-1],0,[0,0,1,0,1,0],[0,0,0,0,0,2],[0,3,0,0,0,0],[4,0,0,0,0,0]],
		[[-1,-1,-1,-1,-1,-1],4,[1,0,0,0,0,1],[0,0,0,2,0,0],[0,3,0,0,0,0],[]]
	],

	"G# Dominant 9th":["G#9",
		[[-1,-1,-1,-1,-1,1],0,[],[],[0,1,0,1,0,0],[2,0,3,0,4,0]],
		[[1,1,-1,-1,-1,-1],5,[0,0,0,1,0,0],[0,0,2,0,0,3],[0,0,0,0,4,0],[]]
	],

	/******* SCALES ********/
	"Major Scale":["",
		[[],-1,[],['T',1,0,0,0,0],[0,0,1,1,0,0],[1,1,1,1,1,1],[],[1,1,1,1,1,1],[0,0,0,0,1,1],[]],
		[[],-1,[],[],[0,1,1,1,0,0],[1,'T',1,0,1,1],[0,0,0,1,0,0],[1,1,1,1,1,1],[0,0,0,0,1,0],[]]
	],

	"Major Pentatonic Scale":["",
		[[],-1,[],[],[0,0,1,1,0,0],[1,'T',0,0,1,1],[],[1,1,1,1,1,1],[],[]],
		[[],-1,[],[],[1,1,1,1,1,1],[],[0,1,1,1,0,0],['T',0,0,0,1,1],[],[]]
	],

	"Natural Minor Scale":["",
		[[],-1,[],['T',1,1,1,0,0],[0,0,0,0,1,0],[1,1,1,1,0,1],[1,1,0,0,1,1],[0,0,1,1,0,0],[0,0,0,0,1,1],[]],
		[[],-1,[],[],[1,'T',1,1,1,1],[1,0,0,0,1,1],[0,1,1,1,0,0],[1,1,1,0,1,1],[],[]]
	],

	"Harmonic Minor Scale":["",
		[[],-1,[],['T',1,0,1,0,0],[0,0,1,0,1,0],[1,1,1,1,0,1],[1,1,0,0,0,1],[0,0,1,1,1,0],[0,0,0,0,1,1],[]],
		[[],-1,[],[],[1,'T',1,0,1,1],[1,0,0,1,1,1],[0,1,1,1,0,0],[0,1,1,0,1,0],[1,0,0,0,0,1],[]]
	],

	"Melodic Minor Scale":["",
		[[],-1,[],['T',1,0,1,0,0],[0,0,1,0,0,0],[1,1,1,1,1,1],[1,0,0,0,0,1],[0,1,1,1,1,0],[0,0,0,0,1,1],[]],
		[[],-1,[],[],[1,'T',1,0,1,1],[0,0,0,1,1,0],[1,1,1,1,0,1],[0,1,0,0,1,0],[1,0,1,0,0,1],[]]
	],

	"Minor Pentatonic Scale":["",
		[[],-1,[],[],[1,'T',1,1,0,1],[0,0,0,0,1,0],[0,0,1,1,0,0],[1,1,0,0,1,1],[],[]],
		[[],-1,[],[],[0,0,1,1,0,0],[1,1,0,0,1,1],[],['T',1,1,1,1,1],[],[]]
	]
};

var ARTICLES = [[],[],[],[],[],[]];
/******* THe first field is reserved for the progression generator, not used for articles (probably) ********/
/******* Chord Theory Articles ********/
ARTICLES[1][0] = '<h1>Chord Theory Overview/Introduction</h1><p>While many people know how to play some basic chords on the guitar (e.g. C, G, Am), most people don&#39;t know why the set of notes they are playing form that particular chord. The broadness and complexity of chord theory is unknown to many even&nbsp;quite skilled guitar players, and that&#39;s a shame - but most of all a missed opportunity. Learning the theory behind chords, scales and melodies in general will increase the amount of chords you know and can form yourself.&nbsp;This makes everything you play more varied, and makes you able to write music more closely to what you hear in your head. Some of this theory will also apply to improvising, writing solos or crafting melodies -- but that is all discussed in a different section (<em>see <b>Guitar Scales</b></em>).</p><p>This section assumes you have&nbsp;<strong>basic guitar knowledge</strong>&nbsp;(knowing the key every string of the guiter is tuned in (EADGBE), how to struck chords or pluck strings, etc.). If you have that figured out (which should be the case if you&#39;ve been playing the guitar for at least a few weeks), it should not be too hard to follow along.</p><p style="padding-left:40px;"><b>PS. </b>It might be useful to open a new tab in which you keep the <em>All Chords</em> section open to quickly check which chords I am talking about or just to play with theories you just learned</p><h2>How do I read chord diagrams?</h2><p>A chord diagram is, in my opinion, the easiest and most intuitive way to display a chord. Therefore, every chord on this website has one. They are&nbsp;generated dynamically, which means you can scale them up infinitely if you so desire. They work like this:</p><img src="HowToReadChordDiagrams-01.png" width="900" /><p>This picture shows two different versions of the same chord, which is D. There are quite a few things going on in this picture, but all the colored text and arrows are of course not included in every diagram - it&#39;s just the chord name(s) and what is inside the grey rectangle</p><h2>Anything else I should know first?</h2><p>Not really, no. Just be prepared to learn a few fundamentals of music you just need to know -- once you are past that stage, it is all fun and games! And of course, it helps if you have a guitar in your hands already when reading this.</p><p>See you in the next chapter!</p>';
ARTICLES[1][1] = '<h1>Music Theory</h1><p>Music theory, to most people, sounds like something very dull and boring. And unnecessary - they want to play their favourite pop songs. But even the simplest of chords has this theory behind it. Add to that the fact that&nbsp;it is something that is applicable to&nbsp;<em>all</em>&nbsp;instruments in the whole world, and there&#39;s reasons enough to learn it. I will not try to mention every single thing, as that would be wat too much to handle.&nbsp;I am actually skipping large parts that are not immediately necessary, to make you focus on the core aspects. First up&nbsp;are the single notes and their relations to each other within octaves.</p><h2>Octaves and Semitones</h2><p>There are 12 known tones in our music world, which are (in alphabetical <em>and</em> musical order): A A# B C C# D D# E F F# G G#. An&nbsp;<strong>octave</strong>&nbsp;is the set of notes between a certain tone and a tone that has exactly double or half the frequency. This simply means that the notes I wrote in alphabetical order at the start of this paragraph, form one single&nbsp;octave&nbsp;starting from A. But an even easier way to view it is that if you start at a certain note (say C) on the guitar, and move one fret upwards 12 times, you&#39;ll be at the same tone (C again) but (one octave) higher.</p><p>That thing you just did, moving one fret upwards, could be called moving up a single&nbsp;<strong>semitone</strong>&nbsp;at a time. A semitone is nothing else than the difference between a certain note and the one immediately next to it on the same string. Or if you also play piano, it&#39;s the difference between a certain key and the one immediately next to it. So, what an octave actually is, is a collection of semitones from a base key. If I were to pick D as the base key for my song, I could point out for every&nbsp;note that my guitar can play at how many semitones&nbsp;it is located&nbsp;from that base key.</p><h2>Tone names &amp; distances</h2><p>So, if there are <em>twelve</em>&nbsp;semitones in an octave, why is it called an&nbsp;<strong>octa</strong>ve&nbsp;then? Because there are 7 actual <strong>tone distances.</strong></p><p>If you tried to make a melody using&nbsp;<strong>all</strong>&nbsp;the notes in a certain octave, you&#39;d quickly find out that it&#39;s impossible to find an order in which they all sound well together. Within an octave, it depends on where you start and what key you&#39;re playing in (major/minor) which notes actually sound well together, and which you should avoid by all means. Within any octave, there are 7 distances between notes (of either 1 or 2 semitones) that you can actually use and will sound well together. And the best thing is: we don&#39;t need to randomly guess what&#39;s going to work. Here&#39;s a list of all semitones and their names/functions (make sure to memorize it!):</p><table id="articleTable" cellpadding="5" cellspacing="1"> <tbody> <tr> <td><b>Semitones</b></td> <td><b>Common Name</b></td> <td><b>Alternate Names</b></td> </tr> <tr> <td>0</td> <td>perfect unison</td> <td>diminished second, base tone, key, <b>tonic</b></td> </tr> <tr> <td>1</td> <td>minor second</td> <td>augmented unison</td> </tr> <tr> <td>2</td> <td>major second</td> <td>diminished third</td> </tr> <tr> <td>3</td> <td>minor third</td> <td>augmented second</td> </tr> <tr> <td>4</td> <td>major third</td> <td>diminished fourth</td> </tr> <tr> <td>5</td> <td>perfect fourth</td> <td>augmented third</td> </tr> <tr> <td>6</td> <td>tritone</td> <td>augmented fourth, diminished fifth</td> </tr> <tr> <td>7</td> <td>perfect fifth</td> <td>diminished sixth, <b>dominant</b></td> </tr> <tr> <td>8</td> <td>minor sixth</td> <td>augmented fifth</td> </tr> <tr> <td>9</td> <td>major sixth</td> <td>diminished seventh</td> </tr> <tr> <td>10</td> <td>minor seventh</td> <td>augmented sixth</td> </tr> <tr> <td>11</td> <td>major seventh</td> <td>diminished octave</td> </tr> <tr> <td>12</td> <td>perfect octave</td> <td>augmented sventh</td> </tr> </tbody> </table><p>There are lots of patterns to be seen here. If we only look at the alternate names for a moment, we observe it almost exclusively consists of&nbsp;<em>diminished</em>&nbsp;and&nbsp;<em>augmented</em>&nbsp;tones. They sound dangerous, but what they mean is this:&nbsp;</p> <ul> <li><strong>Augmented</strong>&nbsp;means you see a note, and take it a semitone&nbsp;<em>higher</em>.&nbsp;</li> <li><strong>Diminished&nbsp;</strong>means you see a note, and take it a semitone&nbsp;<em>lower</em>&nbsp;</li> </ul> <p>With that out of the way, we can see from&nbsp;the common names that - as I said before about the seven tone distances -&nbsp;&nbsp;the numbering goes from second tot seventh (with 0 semitones as the 1st&nbsp;note, and 12 semitones as the 8th&nbsp;note to get an octave).</p> <p>But that&#39;s not all: the&nbsp;<em>second, third, sixth</em>&nbsp;and&nbsp;<em>seventh</em>&nbsp;all have a minor and major component. The&nbsp;<em>fourth and fifth&nbsp;</em>are perfect by themselves, and the&nbsp;<em>tritone</em>&nbsp;between them is kind of a special one (adding it to chords gives a strange but not always unpleasant sound). What all of this basically means, is that some of these notes are almost always present and&nbsp;shifted one semitone between major and minor chords, while other notes are rarely changed or used.</p> <h2>Back to basic Melodies</h2> <p>I talked about creating melodies from all the notes in an octave, and why that doesn&#39;t work. Now that we know the function of every note, we can start to assemble sets of seven&nbsp;notes that work well together. The standard&nbsp;<strong>major scale</strong>&nbsp;for example goes something like this:</p> <ul> <li>0 =&gt; 2 =&gt; 4 =&gt; 5 =&gt; 7 =&gt; 9 =&gt; 11 ( =&gt; 12). For C as the tonic key, this would mean C =&gt; D =&gt; E =&gt; F =&gt; G =&gt; A =&gt; B =&gt; C.&nbsp;</li> </ul> <p>Why does this work? Well, we took the major component of every note that had one, and filled up what was in between with just the perfect fourth and perfect fifth. If you wanted to get the standard&nbsp;<strong>minor scale</strong>, you&#39;d do the same but then take the minor components.</p> <p>Knowing this, it already gets easier to get a basic melody going. But, we&#39;ve actually come here to learn about chords, so there&#39;s only paragraph left and then we&#39;ll start on some fun with chords.&nbsp;</p><h2>Chords and Progressions from Scales</h2> <p>Every chord is in it&#39;s most basic form part of the major or minor scale. For example, a&nbsp;standard C Major chord uses C, E and G (which are all part of that major scale you just saw). On top of that, they all know a lot of variations that include, substitute or leave out certain semitones (like a Cmaj7 replaces the highest note in the C&nbsp;to its seventh). Knowing these scales helps you form the chords.</p> <p>But they also give you a hand when creating <strong>chord progressions</strong>. For example,&nbsp;chords created from the C, Em and G sound great together, but adding a little extra to each of them (Cadd9, Em7 and Gsus4) makes it even better. If that still sounds like magic, don&#39;t worry,&nbsp;I&#39;ll talk about this more in all the other sections whenever it is relevant.</p>';
ARTICLES[1][2] = '<h1>Major Chords</h1> <p>The major chords I will discuss in this section are mostly the very basic ones on which everything else is based. Those include the first chords a beginner guitarist will learn (C, G), but also the ones that are more complicated to play (A#, or Bb). Every other chord that falls into the &#39;major category&#39; has the same idea behind it, but with extra notes added or some removed.</p> <h2>Triads</h2> <p>All basic chords are a set of&nbsp;<strong>three</strong>&nbsp;notes, making them so-called&nbsp;<em>triads</em>. Those three notes always follow the same pattern, which is useful, because it enables you to quickly find out how to play any chord yourself (in case you can&#39;t remember them all). On the piano, this makes things very easy, because you can just play those three notes and you will have your chord. On the guitar, it&#39;s a little harder. This is because you strike all 6 strings when you play a chord, which means that a string needs to either be&nbsp;<em>muted</em>&nbsp;(laying (part of) a finger over it without pressing on it) or it has to make a note that&nbsp;<em>fits within the scale</em>. This makes it easy to get confused and think that for example a B (which is usually&nbsp;played with more than three fingers, unless yours are superflexible) is not a triad. But nothing could be further from the truth.</p> <p>So how do you form those triads? Take your <strong>unison</strong>&nbsp;- that will be your first note. Then take the&nbsp;<strong>major third&nbsp;</strong>as the second note, and the <strong>perfect fifth</strong>&nbsp;as your third. That&#39;s it, you just created an abstract&nbsp;triad! Let&#39;s do an example using C:</p> <ul> <li>The notes in the major scale are&nbsp;C =&gt; D =&gt; E =&gt; F =&gt; G =&gt; A =&gt; B. So the <em>unison</em>&nbsp;is&nbsp;<strong>C</strong>.&nbsp;This makes&nbsp;<strong>E</strong>&nbsp;the&nbsp;<em>major third</em>, and&nbsp;<strong>G</strong>&nbsp;the&nbsp;<em>perfect fifth</em>. And there you have it, the C chord is C E G!</li> </ul> <p>In case you were in doubt: this works for every single tone. Just try it out on G, or A, or E, and you will find the same results.</p> <h1>Minor Chords</h1> <p>Minor chords are equally important as major ones, and don&#39;t differ that much from them. Nevertheless, they create a very different tone and can not just be swapped with their major sidekick any time you want.</p> <p>To form them, first take your&nbsp;<strong>unison</strong>. Then as the second note, instead of using a major third, we will use a&nbsp;<strong>minor third</strong>. The third note will just be the same&nbsp;<strong>perfect fifth</strong>, as it is perfect in either major and minor. Let&#39;s do an example using D this time:</p> <ul> <li>The notes in the minor scale are D =&gt; D# =&gt; F =&gt; G =&gt; A =&gt; A# =&gt; C. This gives us&nbsp;<strong>D F A</strong>&nbsp;for a&nbsp;<em>D minor&nbsp;</em>(Dm).&nbsp;</li> </ul> <h1>Forming Chord Progressions</h1> <p>Most (popular)&nbsp;songs, if not all of them, use a major or minor scale to form their chord progressions. Which chords sound good together can be determined via some simple rules, and even the order in which you play&nbsp;them&nbsp;can make a drastic difference. Here I&#39;ll give you the rules for forming these chords, and a list of popular progressions that just work really well.</p> <p>But before we jump into that, first some <em>notational rules</em>. Chords in a scale are numbered using&nbsp;<em>roman numerals -&nbsp;</em>I, II, III, IV, etcetera. Furthermore, major chords are written in uppercase (<strong>IV</strong>), while minor ones are written in lowercase (<strong>iv</strong>).</p> <p>&nbsp;</p><h2>Major scale</h2> <p>We&#39;ve already seen how to determine the notes, so we only need to know if the chords that accompany them should be minor or major. Memorize this:</p> <ul> <li>( I&nbsp;) MAJOR, ( ii ) minor, ( iii ) minor, ( IV ) MAJOR, ( V )&nbsp;MAJOR, ( vi ) minor, (vii)&nbsp;<em>diminished</em>&nbsp;</li> <li>Take C for example, it becomes: C, Dm, Em, F, G, Am, Bdim.</li> </ul> <p>You might think: &#39;alright, alright...wait, what is a diminished <em>chord</em>?&#39; It is simply a triad chord with a minor third, and a diminished fifth -- but we&#39;ll get to that later, diminished chords are not used that often.</p> <p>But, you can try this out on any key you want, it&#39;s gonna work and the chords will sound great together. But how do I know how many to play? How do I know the order to play them in? Well, you can do whatever the hell you want, but here&#39;s a list of common progressions:</p> <ul dir="ltr"> <li>I &ndash; IV</li> <li>I &ndash; V</li> <li>I &ndash; IV &ndash; V</li> <li>I &ndash; IV &ndash; I &ndash; V</li> <li>I &ndash; IV &ndash; V &ndash; I</li> <li>I &ndash; V &ndash; IV &ndash; I</li> <li>I &ndash; V &ndash; IV &ndash; V</li> <li>I &ndash; V &ndash; vi &ndash; IV</li> <li>I &ndash; vi &ndash; V &ndash; IV</li> <li>I &ndash; vi &ndash; IV&nbsp;&ndash; V&nbsp;</li> <li>I &ndash; IV &ndash; vi &ndash; V</li> <li>I &ndash; IV &ndash; V &ndash; IV</li> <li>vi &ndash; IV &ndash; I &ndash; V</li> </ul> <h2>Minor&nbsp;scale</h2> <p>For minor scales, the same idea is applied but with a slightly different outcome. Memorize this:</p> <ul> <li>( i&nbsp;) minor, ( ii )&nbsp;<em>diminished, </em>( III )&nbsp;MAJOR, ( iv )&nbsp;minor, ( v ) minor, ( VI ) MAJOR, ( VII ) MAJOR</li> <li>Take D (minor)&nbsp;for example, it becomes: Dm, D#dim, F, Gm, Am, A#, C</li> </ul> <p>If you&#39;re paying attention, you might see that this is&nbsp;<em>exactly</em>&nbsp;the same as the major ones, but just shifted 6 places. The minor at place&nbsp;<strong>vi</strong>&nbsp;has now become the first key in the scale (&nbsp;<strong>i&nbsp;</strong>), and everything else has followed this switching of places.</p> <p>To finish off, a nice list of common&nbsp;progressions:</p> <ul dir="ltr"> <li>i - iv - v - i</li> <li>VI - VII - i - i</li> <li>i - VII - VI - VII</li> <li>i - VII - VI - V7</li> <li>i - iv - i - iv</li> <li>v - iv - i - i</li> <li>ii - v - i - i</li> <li>i - VII - VI - v - iv - III - ii - i</li> </ul>';
ARTICLES[1][3] = '<h1>Dominant Chords</h1> <p>We&#39;ve looked at the basic major and minor triads, and before doing any really fancy stuff I want to expand on a group of chords that does nothing but add extra notes to major triads.&nbsp;They are&nbsp;used far more often than many people think, although they are often initially&nbsp;confused with other chords with similar sounding names --&nbsp;which makes things sound horrible, actually.</p> <p>The correct notation for dominant chords is nothing more than simply adding a number after the tonic, so for example A7,&nbsp;C7 or F9.</p> <h2>The Secret is&nbsp;in the Name</h2> <p>When we looked at the names of different semitones, you might have seen that the&nbsp;<strong>perfect fifth</strong>&nbsp;would also be called&nbsp;<strong>dominant</strong>. It&#39;s called this way because it is the most important note of the whole octave, after the&nbsp;tonic&nbsp;or unison&nbsp;of course.</p> <p>Why is this one&nbsp;so important? Nobody really knows why, but the fact is that the tonic and the dominant just sound very good when played after each other, like they long for each other and really want to work together for this melody. The whole idea of dominant chords is based on the fact&nbsp;that if you add&nbsp;<em>notes from the dominant chord&#39;s triad</em>&nbsp;to the tonic&#39;s triad, they also sound great together, and that all put&nbsp;into one chord! But, do not fear, there&#39;s no need to work out whether a certain note is part of&nbsp;the dominant&#39;s chord or not - it works the same for everything.</p> <h2>Magic Numbers</h2> <p>There are 4 numbers closely related to dominant chords:&nbsp;<strong>7, 9, 11, 13</strong>. They do not work individually, but add up like this (X is an arbitrary major triad):</p> <ul> <li><strong>X7:&nbsp;</strong>X triad plus the minor seventh</li> <li><strong>X9:</strong>&nbsp;X triad plus the minor seventh plus the major ninth (<em>none</em>)</li> <li><strong>X11:</strong>&nbsp;X triad plus the minor seventh plus the major ninth plus the&nbsp;eleventh (<em>undeciem</em>)</li> <li><strong>X13:</strong>&nbsp;X triad plus the minor seventh plus the major ninth plus&nbsp;the&nbsp;minor&nbsp;thirteenth (<em>tredeciem</em>)</li> </ul> <p>Woah, didn&#39;t the octave go to 8th max? Well, yes, but there&#39;s more octaves than one, so we can simply keep counting. This means the ninth is the second, the eleventh is the fourth and the thirteenth is the sixth -- but all&nbsp;one octave higher. Simply subtract 7 from the number, and you have what you want.</p> <h2>An Example</h2> <p>Let&#39;s take C as example. The dominant of C is the perfect fifth, which is G. Let&#39;s form some chords:</p> <ul> <li><strong>C7:&nbsp;</strong>C, E, G and A#</li> <li><strong>C9:</strong>&nbsp;C, E, G, A# and D</li> <li><strong>C11:</strong>&nbsp;C, E, G, A#, D and F</li> <li><strong>C13:</strong>&nbsp;C, E, G, A#, D and A</li> </ul> <p>If the amount of notes in the last two seems like much - it is, and it will take some practice to get them right. But they can add beautiful sounds!</p> <p>Now let&#39;s see what&#39;s inside the dominant. If we take a look at a G13, we can see it consists of the notes G, B, D, F, A and E&nbsp;=&gt; only the B is nowhere to be found in the C-chords. If we for example look at a Gm7, G minor seventh, we see it has the notes G, A#, D, F =&gt; again we have most of the notes except for C. This might seem gimmicky at first, but if you do this a few times you&#39;ll see that creating a dominant chord from a simple major triad will create connections with its dominant that will really boost the sound of your chord progressions.</p> <p>&nbsp;</p> <p>&nbsp;</p> <p>&nbsp;</p> ';
ARTICLES[1][4] = '<h1>Slash Chords</h1> <p>We&#39;re not going to destroy anything. The aim is not to break your pick or strings. It&#39;s simply a convenient name for chords that have a slash (<em>&nbsp;</em><strong>/</strong><em>&nbsp;</em>) in them. They are used very often, especially in rock or alternative music, as they create a fuller sound and extend the bass line. They can however be formed in many, many different ways, so you won&#39;t&nbsp;find a list of them anywhere. The common ones you will find, but if you want something else you&#39;ll have to make it up yourself. But it&#39;s not hard, and I will teach you the ways!</p> <h2>What are they?</h2> <p>A slash chord is of the form&nbsp;<strong>X/Y</strong>, where&nbsp;<strong>X</strong>&nbsp;refers to the <em>main chord </em>and&nbsp;<strong>Y</strong>&nbsp;refers to the&nbsp;<em>bass note.</em>&nbsp;For example,&nbsp;<strong>C/G</strong>&nbsp;is a C major chord, but with an extra finger on the lowest E string to get an extra low G. Another popular one is the&nbsp;<strong>D/F#,&nbsp;</strong>a D with an extra finger on the lowest E string to create a F#. It&#39;s often used to get a nice transition from G to Em, while not temporarily&nbsp;creating a completely different sound like a a full-fledged&nbsp;F# chord would do.</p> <h2>How do I make them?</h2> <p>Pick a chord. Pick a bass note. Combine!</p> <p>Well, of course you&#39;re going to run into problems with bass notes that don&#39;t sound&nbsp;<em>at all</em>&nbsp;with your chord, or chords where you just don&#39;t have any fingers left to do something extra. Sometimes it will just not be possible, and some notes just keep clashing, but the amount of possibilities is so great that you will always be able to find something satisfying. A bit of a guide:</p> <ul> <li>Bass notes are important, they are the heart and soul of a song&nbsp;(together with the drums, if the track is not acoustic). Therefore, you must first know where you want the bass line to go. Figure that out, the precise note you want to get, then move on.</li> <li>Now go check some chords. You can use the natural scales (major or minor, depends on the key the song is in) to find which ones fit, or just try things out. If it sounds good, it&#39;s good. If it doesn&#39;t sound right, it&#39;s not good.&nbsp;</li> <li>That leaves a lot of chords possible for one bass note, so what you typically want is to either find something that <em>emphasises the bass note</em> (so, the same note but one or two octaves higher) or something that partically <em>carries the same notes as the previous or upcoming chord</em> (as slash chords are usually transition chords).</li> </ul> <p>However, there&#39;s also a different technique (or way to look at it)</p> <ul> <li><strong>Chord inversion:</strong>&nbsp;switching the order in which you play notes of a chord. This usually involves placing one of the notes that used to be on the higher strings, on one of the two lowest ones. Essentially, this doesn&#39;t change anything, but it places the emphasis on a different part of the chord, and makes it a slash chord. For example, the D/F# I just talked about is your regular D Major, but instead of playing the F# on the high E-string, it is played on the low one.</li> </ul> <h2>Some very common examples</h2> <p>All of these are also listed in the All Chords library, but I only&nbsp;give you the names here so you get the chance to try forming them yourselves first:</p> <ul> <li>D/F#</li> <li>C/G</li> <li>C/B</li> <li>D/B</li> <li>Dm/C</li> <li>Em/D</li> <li>E/C#</li> <li>G/F#</li> <li>Am/G</li> <li>Bm/A</li> <li>D/C</li> <li>E/G#</li> </ul> <h1>Power Chords</h1> <p>Power chords are, as the name suggests, to bring power, energy and drive into your song. However, as the name does not suggest, it is not really a chord. When you play a powerchord in a certain key, you only play the tonic and the dominant notes. That&#39;s two notes, not enough to make a triad, so we&#39;re not allowed to formally call this a chord. However, they are essential to all pop/rock/punk music, as they are designed to create a full and strong tone on an&nbsp;<em>electric guitar.&nbsp;</em>Of course, they can be played on any guitar, but won&#39;t sound so well.&nbsp;</p> <p>Why is that? Well, because a power chord is fuller and more substantial than just playing a single bass note, but it doesn&#39;t have the high overtones of regular chords that can make it sound really bad on a guitar with distortion over it. So, even though they aren&#39;t real chords, they are important enough to be given their own names and subgroup within chords.</p> <h2>So, how exactly&nbsp;do I make a power chord?</h2> <p>Pick the key. Find that note on the lowest E string. Then&nbsp;count which note is the dominant (perfect fifth), and find that note on the A string. Then, to finish it off, you should be able to find your key note again on the D string. To make it not sound extremely weird, you will have to&nbsp;<em>mute</em>&nbsp;the lowest three strings or you just need to make sure you don&#39;t accidentally play them. And there you have it, a power chord!</p> <p>Notation&nbsp;is usually a simple&nbsp;<strong>X5</strong>, as the chord is basically X plus it&#39;s fifth, so that shouldn&#39;t come as a big surprise.</p> <h2>Specialties</h2> <p>Some notes&nbsp;have a power chord variation that&#39;s actually not full of power. These have a lot of open strings, and are usually a favourite amoung acoustic guitar players. Let&#39;s take the&nbsp;<strong>G5&nbsp;</strong>as an example:</p> <ul> <li>Its power chord variation that would work fine for electric guitar players, is a simple <span style="color:#B22222">355xxx</span>.</li> <li>However, this can also be played as <span style="color:#A52A2A">300000</span>. Just a G on the low E string, and for the rest complete openness. Sounds bad in a rock song, sounds great when playing a calm acoustic song.</li> </ul>'; 
ARTICLES[1][5] = '<h1>Miscellaneous</h1> <p>Although this sounds like it&#39;s a section of leftovers, a better way to think of it is&nbsp;<em>superawesome and very necessary extras</em>. There are simply too few of these chords in the world to put them in a seperate group, but all of these still play quite a big and important part in the world of guitar chords.</p> <h2>Major and Minor Sevenths</h2> <p>In regular chords, the sixth and seventh feel kinda left out. This is the moment they jump into the spotlight and proof their worthiness. Though their notation always leads to some confusion:</p> <ul> <li><strong>Xmaj7</strong>&nbsp;means a major seventh</li> <li><strong>Xm7</strong>&nbsp;means a minor seventh</li> <li><strong>X7</strong>, without anything before the seven, means a&nbsp;<em>dominant chord</em>. It&#39;s different.</li> </ul> <p>A&nbsp;<strong>major seventh</strong>&nbsp;is nothing more than a major triad with an extra&nbsp;<em>major seventh</em>. This usually means that one of the notes in the chord is pushed back one fret, and nothing else changes. Most chords have mulitple occurences of their&nbsp;tonic, so the duplicates can be reshaped to a seventh.</p> <p>A<strong>&nbsp;minor seventh</strong>&nbsp;is equally simply, it just includes an extra&nbsp;<em>minor seventh</em>. This usually means pushing back that note two frets.</p> <p>Unlike dominant chords, these changes are quite subtle and usually make the sound just a bit fuller, brighter or feel more complete.</p><p style="padding-left:40px;">There is also the same idea, but with ninths instead of sevenths. It is much less common, but can still be useful to know</p> <h2>Suspended chords</h2> <p>When I heard the term I somehow immediately thought of suspended rollercoasters, but that&#39;s not what it&#39;s like (unfortunately). A better word for it I think would be&nbsp;<strong>substitution</strong>. The notation is like this:&nbsp;</p> <ul> <li><strong>Xsus2&nbsp;</strong>&nbsp;or&nbsp;<strong>Xsus4&nbsp;</strong>(suspension only ever happens with the major second or perfect fourth).</li> </ul> <p>A&nbsp;<strong>suspended chord</strong>&nbsp;means&nbsp;<em>switching&nbsp;</em>or&nbsp;<em>substituting</em>&nbsp;the second note in your triad (major or minor third, whatever you like) for a&nbsp;<em>major second</em>&nbsp;or a&nbsp;<em>perfect fourth</em>. This usually frees up chords (you have to play less notes, more strings are open). In the rare cases where it doesn&#39;t have that effect, it creates extra higher notes and emphasises them more.</p> <p>Beware: there is no major and minor form for these kind of chords. As seen that the second note in the chord triad determines major-ness or minor-ness, switching it out for something that is not a third makes the chord lose that and just become sort of neutral.</p> <h2>Major and Minor Sixths</h2> <p>Just as we saw&nbsp;with the sevenths, we can add the sixth to the regular major or minor triad. However, because the six is not a number that&#39;s part of the dominant chords, notation follows regular patterns again:</p> <ul> <li><strong>X6&nbsp;</strong>means a major sixth</li> <li><strong>Xm6</strong>&nbsp;means a minor sixth</li> <li>(<strong> Xadd6</strong>&nbsp;or <strong>Xmadd6</strong>&nbsp;means&nbsp;exactly the same, and is sometimes used instead. )</li> </ul> <p>These chords usually have weird, strange, exotic tones. There are not used very often in combination with regular, basic chords I&#39;ve already mentioned. If one is used with them, it will need to really fit in there and it will most certainly stand out. However, it&#39;s worth experimenting with them, and perhaps you can create a song with only sixths in it.</p> <h2>&#39;add&#39; Chords</h2> <p>There&#39;s no real name for this group, and I think it can&#39;t even be called a group. But, it is seen very often, and used spontaneously across the world by all sorts of songwriters. The only version that&#39;s really necessary or adds something of value is the so called&nbsp;<strong>Xadd9</strong>. The only thing it does is&nbsp;<em>add</em>&nbsp;the number (in this case the ninth) to the regular triad. It doesn&#39;t remove, substitute or move anything, just adding.</p> <p>It is also seen with an&nbsp;<strong>add6</strong>&nbsp;or&nbsp;<strong>add2.&nbsp;</strong>But, the&nbsp;<strong>add6</strong>&nbsp;is exactly the same as simply putting a&nbsp;<strong>6</strong>&nbsp;behind the chord name, so it&#39;s not really necessary to add the <em>add</em>.</p> <p>With&nbsp;<strong>add2</strong>&nbsp;it&#39;s a bit different. The ninth note is exactly the same as the second, but one octave higher. So one could argue that&nbsp;<strong>add2</strong>&nbsp;adds a low, bassy note to the chord and&nbsp;<strong>add9</strong>&nbsp;adds a higher note. I&#39;m fine with that explanation, and it is even very&nbsp;useful if you were really looking to add some low notes to a chord, but keep in mind that they are the same chords theoretically speaking.</p><h2>Augmented and Diminished Chords</h2> <p>While these two are the exact opposities of each other, I still think you should look at them in the same way. As discussed earlier,&nbsp;<strong>regular&nbsp;</strong><em>augmented</em>&nbsp;and&nbsp;<em>diminished</em>&nbsp;chords only do their work on the third note (the perfect fifth) of a triad.</p> <ul> <li><strong>Augmented:</strong>&nbsp;raises that note by a semitone. Notation:&nbsp;<strong>X+</strong> or&nbsp;<strong>Xaug</strong>. Sometimes&nbsp;<strong>X#Y</strong>, but rarely.</li> <li><strong>Diminished:&nbsp;</strong>lowers that note by a semitone. Also uses the minor third.&nbsp;Notation <strong>X<sup>0</sup></strong> or&nbsp;<strong>Xdim</strong>. Sometimes <strong>Xb</strong>, but rarely.</li> </ul> <p>However, we can also tweak and play a little with other notes than the perfect fifth. This is where it gets real tricky though. I&#39;ll give you a few relatively common ones to get the idea:</p> <ul> <li><strong>X<sup>07</sup>&nbsp;</strong>is a regular diminished chord, but with a diminished minor seventh added. Basically, it is an&nbsp;<strong>Xdim</strong>&nbsp;but with an extra major sixth.</li><li><strong>Xm7b5</strong> is the minor triad of X, but with a minor seventh added <em>and</em> a diminished fifth.</li></ul>';
/******* Guitar Scales Theories ********/
ARTICLES[2][0] = '<h1>Introduction to Guitar Scales</h1><p>Once you&#39;ve learned everything there is to know about chords, it&#39;s time you move on to creating melodies, solos and advanced chord progressions from guitar scales. Usually, this is taught the other way around, which is quite a logical thought&nbsp;-- first learn how to make&nbsp;single notes sound nicely together, then start playing them in groups called chords. Why I focused on chords first, is because all those scales have certain chord variations that fit nicely with them, and now I am able to give those to you along with the scales. This will enable you to for example create a melody from a scale, and immediately be able to find the best chords to&nbsp;fit to it.</p> <h2>How do I read Scale Diagrams?</h2> <p>They are not much different from chord diagrams. The only thing is that, because we&#39;re talking about single notes here, it doesn&#39;t matter which finger is playing them. It also doesn&#39;t matter if you mute a string or leave it open - as you won&#39;t play it anyway. And from which fret you start depends on the key you&#39;re playing the scale in. So, it looks like this:</p><img src="HowToReadScaleDiagrams-01.png" width="900" /><p>As you can see, reading scale diagrams is much easier than chord diagrams, but actually memorizing and using them is a bit harder, because there are much more notes to remember and available for use. The best way to learn them therefore is by playing through them a lot. Over time, you&#39;ll not only remember each and every note, you&#39;ll also get to know some cool melodies or licks that can be played. You can then incorporate that knowledge into every song or solo you write or play.</p> <p>What must be noted however, is that you&#39;re not restrained to the notes displayed in the scale diagram. They are the notes that are in close proximity and can easily be accessed from the tonic note -- they are the ones you will play most often when using the scale. But the good news is that&nbsp;you can always go higher or lower on any string whenever you feel like it. There are a bunch of other notes on your guitar that still sound great with this scale, the only problem is that they are harder to reach and it is not easy to find them spontaneously. But, as always, practice makes perfect!</p> <p>In the next few sections I&#39;ll discuss the most famous scales, and show you what chords typically sound well when played alongside them.</p><p style="padding-left:40px;"><strong>PS. </strong>Remember that you can always hover over the scales inside the articles to see them enlarged, or click on them to make all their variations appear underneath it.</p>';
ARTICLES[2][1] = '<h1>Major Scales</h1><p>There are two so-called major scales:&nbsp;<strong>regular major scale</strong>&nbsp;and the&nbsp;<strong>pentatonic major scale</strong>. The difference is mainly that the regular major scale contains more notes, but has less chords that fit with it. Even though the regular scale may be called more &#39;complete&#39; than the pentatonic one, the latter is usually taught first to beginning guitarists because of its simplicity. Here I&#39;ll discuss both of them in the traditional order, as I see the pentatonic more as a derivative of the regular major scale.</p><div id="chordRow0" title="Major Scale" class="inlineChord toLeft"></div><h2>Standard Major Scale <em>(Ionian Mode)</em></h2> <p>On the left you can see the&nbsp;scale diagram of this type, and if you scroll down a bit to the pentatonic one you&#39;ll see that this one has the same notes but six more. This makes it possible to have a variation where the tonic note is on the lower E-string, so if you want to have more low notes or more possibilities in that area, you should go with this one. The chords that can be played with this one are:</p> <ul> <li>Major triads</li> <li>Maj7 chords</li> <li><strong>Example:</strong>&nbsp;If we take C as the tonic, we could for example play a melody on this scale and have the chord progression C -&nbsp;Cmaj7 - Gmaj7&nbsp;with it.</li></ul>Also, here is a list of what type of chords to use with every note in the scale: <ul><li>( I ) Major 7th, ( ii ) Minor 7th, ( iii ) Minor 7th, ( IV ) Major 7th, ( V ) Dominant 7th, ( vi ) Minor 7th, ( vii ) Half-Diminished</li><li><strong>Example:</strong> Taking C again, chords that will always go great together are: Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bdimb5</li></ul><div id="chordRow1" title="Major Pentatonic Scale" class="inlineChord toRight"></div><h2>Pentatonic Major Scale</h2> <p>On the right you can see the diagram for this type. As the&nbsp;<strong>penta</strong>&nbsp;part of the name suggests, this scale is made up of only five notes per octave, which means it doesn&#39;t include the (perfect) fourth and the (major) seventh. This means all sorts of chord variations (sevenths, ninths, etc.)&nbsp;can be added, because this scale doesn&#39;t include those. The chords that can be played with this one are:</p> <ul> <li>Major triads</li> <li>Maj7</li> <li>Add9</li> <li>6th</li> <li>7th</li> <li>9th</li> <li>13th</li> <li><strong>Example</strong>. If we take C as the tonic, you could have a verse with chord progression C - C6, and then the chorus with F - G7 - C - Cadd9.</li> </ul>';
ARTICLES[2][2] = '<h1>Minor Scales</h1> <p>Even though you expect the minor scales to behave roughly&nbsp;same way as the major ones, because that&#39;s usually how major and minor ar connected, there are more minor scales than two. Of course, there is the&nbsp;<strong>natural minor scale</strong>&nbsp;and then the down-sized&nbsp;<strong>pentatonic minor scale</strong>. But there&#39;s also the&nbsp;<strong>harmonic minor scale</strong>&nbsp;and&nbsp;<strong>melodic minor scale</strong>. There are minor differences (pun intended) between all of them, but enough to make the sound and feel&nbsp;very different.</p><div id="chordRow0" title="Natural Minor Scale" class="inlineChord toLeft"></div><h2>Natural Minor&nbsp;Scale&nbsp;<em>(Aeolian Mode)</em></h2> <p>Same as the regular major scale, but with the minor components instead of the major ones. On the left you can see what it looks like. As you&#39;d&nbsp;expect, this should be used when playing in a minor key. It encompasses the same notes that are used in all minor chords/triads, which makes it the most universal and basic minor scale. This doesn&#39;t mean it can just be used always and everywhere, but it means that if you are playing a song with only basic minor triads,&nbsp;there are no notes outside of this scale that sound great with the key of your melody/song. The chords that can be played with this one are:</p> <ul> <li>Minor triads</li> <li>m7</li> <li>m9</li> <li><strong>Example:</strong>&nbsp;Say C is your tonic, then a progression of Cm7 - Gm - Am - Em would do.</li> </ul><hr /><div id="chordRow1" title="Harmonic Minor Scale" class="inlineChord toRight"></div><h2>Harmonic Minor Scale</h2> <p>It&#39;s the same as the natural minor, but with a raised<em> (augmented) </em>seventh, which means there&#39;s an unique jump of 3 semitones between the sixth and seventh note. This was once invented because people didn&#39;t like the 2 seminote jump between the seventh and the tonic (one octave higher), so they raised the seventh to get only a single semitone difference.</p> <ul> <li>Minor triads</li> <li>mmaj7 (a minor triad, but with a major seventh added)</li> <li><strong>Example:</strong>&nbsp;This is used almost exclusively in Jazz music, and honestly the only chord progression I know of is:&nbsp;Dm - Dmmaj7 - Dm7 - G9/B</li> </ul><br/><br/><br/><hr /><div id="chordRow2" title="Melodic Minor Scale" class="inlineChord toLeft"></div><h2>Melodic Minor Scale</h2> <p>Because the harmonic minor scale sounded kinda weird and not very helpful to most people, they invented a way to still keep the 1 seminote difference at the end, but remove the bizarre 3 seminote jump. This essentially makes this the same as the&nbsp;<em>regular major scale</em>,&nbsp;<strong>but</strong>&nbsp;with a&nbsp;<strong>lowered third</strong>. And as you may recall, the third is very important when determining if something is major or minor, so even only making the third minor makes this into a minor scale. See what it looks like on the right.</p> <ul> <li>Minor triads</li> <li>mmaj7</li> <li><strong>Example:</strong>&nbsp;Again, mostly used for Jazz music, and not really meant to have fancy chords playing alongside it. Just your basic minor triads (Am - Em for example) should work.</li> </ul> <hr /><div id="chordRow3" title="Minor Pentatonic Scale" class="inlineChord toRight"></div><h2>Pentatonic Minor Scale</h2> <p>And again, just as with the major scale, there&#39;s the one that doesn&#39;t use the fourth and seventh of the scale, which narrows your options for soloing, but opens up your options for chord progressions. See what it looks like on the left.</p> <ul> <li>Minor triads</li> <li>m7</li> <li>m9</li> <li><strong>Example:</strong>&nbsp;Take E as your tonic, then you could do Em7 - Am - D.</li> </ul>';
ARTICLES[2][3] = '';
 //Inserting chords is as easy as <div id="chordRow#" class="inlineChord"></div>
// # is a number that has to be linked to something else...I still have to find a good way to do that.
// Also, inlineChord could have an alternative like inlineChordRight for different floating/centering positions.
ARTICLES[3][0] = '<br><input type="text" id="searchField" placeholder="guitar chord here..."><button onclick="searchChord(0);">SEARCH!</button><br><br>Type the full name or shorthand (e.g. <strong>C Major 7th</strong> and <strong>Cmaj7</strong> are the same)<br><br/><span id="feedbackSpan"></span>';
ARTICLES[3][1] = '<br><table width="100%" cellpadding="10"><tr><td width="33%"><input type="number" min="0" max="12" id="searchField" placeholder="which fret should it start?"  style="width:100%;" onChange="changedFret();"><br><br/><br/>Click anywhere to add a note<br/><br/>For a barre, only add begin and end point</br><br/>Press S to reset everything</td><td><div id="chordRow0" title=" " class="inlineChord diagramSearch" onclick="addNote(event);"></div></td><td><button onclick="searchChordDiagram();">SEARCH!</button></td></tr></table><span style="display: block;margin-top: 300px;font-size: 36px;" id="feedbackSpan"></span>';
ARTICLES[3][4] = '<br><input type="text" id="searchField" placeholder="piano chord here..."><button onclick="searchChord(1);">SEARCH!</button><br><br>Type the full name or shorthand (e.g. <strong>C Major 7th</strong> and <strong>Cmaj7</strong> are the same)<br><br/><span id="feedbackSpan"></span>';
ARTICLES[3][5] = '<br><table width="100%" cellpadding="10"><tr><td><div id="chordRow0" title=" " class="inlineChord diagramSearch piano"></div></td><td><span style="float:right;">Just click to turn certain keys on, click again to turn them off</span><br/><br/><button onclick="searchPianoChordDiagram();">SEARCH!</button></td></tr></table><span style="display: block;margin-top: 300px;font-size: 36px;" id="feedbackSpan"></span>';





