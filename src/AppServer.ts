import * as dotenv from 'dotenv';
import {App} from './App';


dotenv.config();

const port = process.env.PORT;

let server: any = new App().app;
server.listen(port);
console.log("server running on port " + port);