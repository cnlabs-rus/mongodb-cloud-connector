import {MongoClient, MongoClientOptions} from "mongodb";

/**
 * Connect to database depending on environment
 * Currently there are 3 possible environments:
 *  - default
 *    No special environment variables are set
 *      - default call: uses mongodb://localhost:27017/default url to connect
 *      - call with name: uses mongodb://localhost:27017/<name> url to connect
 *  - specified url prefix
 *    MONGODB_URL environment variables is set
 *      - default call: uses <MONGODB_URL>/default url to connect
 *      - call with name: uses <MONGODB_URL>/<name> url to connect
 *  - Cloud Foundry compatible
 *    VCAP_SERICES environment variables is set
 *      - default call: uses first bound service
 *      - call with name: resolve service by name
 *      - No bound services or no service with name causes throwing an Error
 * @param name Name of database or Cloud Foundry bound service
 * @param options Database connection options default is:
 *          {
 *              poolSize: 10,
 *              autoReconnect: true,
 *              useNewUrlParser: true
 *          }
 * @return MongoClient to communicate with mongo
 *      Mongo client is cached by name. It means that you call db() first time to get client connected
 *      any sequential calls will return the same instance unless clearCache is called
 *      Giving so wi need options only in first call
 *      We recommend to make fist call as soon as possible (for example: before express.listen() call to
 *      follow fail fast concept) and pass options to that call. any next call you can specify only name
 *
 *      For example:
 *
 *      app.get("/foo", async (req, res) => {
 *          const bars = db().collection('bar').find({}).toArray()
 *          res.send({bars})
 *      })
 *
 *      db("default", {poolSize: 1}).then(()=> {
 *          app.listen(process.env.PORT)
 *      })
 *
 *
 */
export function db(name?: string, options?: MongoClientOptions): Promise<MongoClient>;

/**
 * clear the cached MongoClient
 * ensure client is closed before clear cache to prevent handle leak
 */
export function clearCache(): void;
