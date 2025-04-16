import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import BudgetRoute from "./routes/BudgetRoute.js";
import TransactionRoute from "./routes/TransactionRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import ScheduledRoute from "./routes/ScheduledRoute.js";
import Dashboard from "./routes/DashboardRoute.js";
import OTPRoute from "./routes/OTPRoutes.js";
import EmailVerificationRoute from "./routes/EmailVerificationRoute.js";
import ForgotPasswordRoute from "./routes/ForgotPasswordRoute.js";
dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
  db: db,
});

(async () => {
  await db.sync();
})();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { secure: "auto" },
  })
);

app.use(UserRoute);
app.use(BudgetRoute);
app.use(TransactionRoute);
app.use(CategoryRoute);
app.use(ScheduledRoute);
app.use(AuthRoute);
app.use(Dashboard);
app.use(OTPRoute);
app.use(EmailVerificationRoute);
app.use(ForgotPasswordRoute);

store.sync();

app.listen(process.env.APP_PORT, () => {
  console.log(`Server is running on port ${process.env.APP_PORT}`);
});
