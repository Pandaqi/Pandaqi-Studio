import Quiz from "./quiz";

const params = {
    defaultCategory: "muziek",
    hideAuthor: true,
}
const quiz = new Quiz(params);
quiz.load();
