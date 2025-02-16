import Quiz from "./quiz";

const params = {
    seed: "newyearsevequiz2024",
    loadExternalMediaAsIframe: true,
    groupBy: "category",
    //url: "/pub-quiz/"
}
const quiz = new Quiz(params);
quiz.load();
