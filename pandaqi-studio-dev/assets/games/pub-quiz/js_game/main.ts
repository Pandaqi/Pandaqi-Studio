import Quiz from "./quiz";

const params = {
    loadExternalMediaAsIframe: true,
    //possibleCategories: [],
    //exclude: { author: "Esther" },
    groupBy: "category"
}
const quiz = new Quiz(params);
quiz.load();
