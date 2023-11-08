import Quiz from "./quiz";

const params = {
    defaultCategory: "muziek",
    hideAuthor: true,
    //groupBy: "category"
}
const quiz = new Quiz(params);
quiz.load();
