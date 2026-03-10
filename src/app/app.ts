import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import router from "./routes";
const app: Application = express();

//parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      
      "https://www.ayravel.com",
      "https://ayravel.com",

      "https://admin.ayravel.com",
      "https://www.admin.ayravel.com",

      "https://www.ayravel-customer.com",
      "https://ayravel-customer.vercel.app",

      "https://ayravel-admin-new.vercel.app",
      "https://www.ayravel-admin-new.vercel.app",

      "https://ayravel-customer-2jgy.vercel.app",
      "https://www.ayravel-customer-2jgy.vercel.app",
    ],
    credentials: true,
  })
);
// Prevent Vercel edge cache from caching CORS responses
app.use((req: Request, res: Response, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

//app routes
app.use("/api/v1", router);

//root route
app.get("/", (req: Request, res: Response) => {
  res.send("AYraveL bd backend api server boosted on....🔥🔥🚀");
});

// //global error handler
app.use(globalErrorHandler);

// //not found route
app.use(notFound);

export default app;
