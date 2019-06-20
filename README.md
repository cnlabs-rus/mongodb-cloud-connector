# mongodb-cloud-connector
Library to work with MongoDB in local and cloud environment
# Environments
* Local
* Cloud Foundry
* GitLab CI (env variable)
#Install
```bash
yarn add @cnlabs/mongodb-cloud-connector
```

```bash
npm install --save @cnlabs/mongodb-cloud-connector
```
# Use
For example use with express web server
```javascript
       import { db } from '@cnlabs/mongodb-cloud-connector';

       app.get("/foo", async (req, res) => {
           const bars = db().collection('bar').find({}).toArray()
           res.send( { bars } )
       });
 
       db('default', {poolSize: 1}).then(()=> {
           app.listen(process.env.PORT)
       });
```

# API
```typescript
function db(name?: string, options?: MongoClientOptions): Promise<MongoClient>;
```
Connects to database depending on environment

Currently supported 3 possible environments:

 - *default*
 
   **No special environment variables are set**
   
     - default call: uses mongodb://localhost:27017/default url to connect
     - call with name: uses mongodb://localhost:27017/<name> url to connect
 
 - *GitLab CI*
 
   **MONGODB_URL environment variables is set**
   
     - default call: uses <MONGODB_URL>/default url to connect
     - call with name: uses <MONGODB_URL>/<name> url to connect
     
 - *Cloud Foundry compatible*
 
   **VCAP_SERICES environment variables is set**
   
     - default call: uses first bound service
     - call with name: resolve service by name
     - No bound services or no service with name causes throwing an Error
     ```
        @param name Name of database or Cloud Foundry bound service
        @param options Database connection options default is:
                 {
                     poolSize: 10,
                     autoReconnect: true,
                     useNewUrlParser: true
                 }
        @return MongoClient to communicate with mongo
             Mongo client is cached by name. It means that you call db() first time to get client connected
             any sequential calls will return the same instance unless clearCache is called
             Giving so wi need options only in first call
             We recommend to make fist call as soon as possible (for example: before express.listen() call to
             follow fail fast concept) and pass options to that call. any next call you can specify only name
     ```
