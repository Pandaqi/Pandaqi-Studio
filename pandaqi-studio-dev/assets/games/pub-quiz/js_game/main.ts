import Quiz from "./quiz";

const params = {
    seed: "newyearsevequiz2024",
    loadExternalMediaAsIframe: true,
    groupBy: "category"
}
const quiz = new Quiz(params);
quiz.load();
