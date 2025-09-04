process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //보안 검증을 무시하는 설정

const express = require("express");
const session = require("cookie-session");
const { PORT, SERVER_SESSION_SECRET } = require("./config.js");

let app = express();

app.use(express.static("wwwroot"));

app.use(
  session({ secret: SERVER_SESSION_SECRET, maxAge: 24 * 60 * 60 * 1000 })
);

//Post 요청에서 JSON 파싱 지원
app.use(express.json( {limit: "10mb"}));

//각각의 라우터 연결
app.use(require("./routes/auth.js"));
app.use(require("./routes/hubs.js"));
app.use(require("./routes/tasks.js"));

//서버 실행
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));