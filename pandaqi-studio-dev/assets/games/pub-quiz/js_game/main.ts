import Quiz from "./quiz";

const params = {
    //loadExternalMediaAsIframe: true
    //possibleCategories: [],
    groupBy: "category"
}
const quiz = new Quiz(params);
quiz.load();
