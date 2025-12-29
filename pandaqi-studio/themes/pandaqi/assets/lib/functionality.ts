import { loadMediaGalleries, loadYoutubeIFrames } from "./functionality/media-gallery";
import { loadNavigation } from "./functionality/navigation";
import { loadStyling, loadStylingPrefetch } from "./functionality/styling";

loadStylingPrefetch();

loadStyling();
loadNavigation();
loadMediaGalleries();
loadYoutubeIFrames();