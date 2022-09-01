import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles,isUrl} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  /**************************************************************************** */
  app.get("/filteredimage/", async (req:Request, res:Response)=> {
    let imageUrl = req.query.image_url
    const filteredImageList:Array<string> = []

    // check if imageUrl is valid
    if (!imageUrl){
      res.status(404).send(`Image url: ${imageUrl} can't be found.`)
    }

    // check if imageUrl is a valid
    if(!isUrl(imageUrl.toString())){
      res.status(400).send(`Bad Request: Image url ${imageUrl} is not valid`)
    }


   try{
     // Filter the image
     const filteredImage =  await filterImageFromURL(imageUrl.toString())
     // append filtered image to filteredImageList
     filteredImageList.push(filteredImage)

     // send filtered image response
     res.sendFile(filteredImage)

     res.on('finish',async()=>{
       await deleteLocalFiles(filteredImageList)
     })
   }catch (e) {
     res.status(400).send(`Bad Request: An error occurred `)
   }

  })
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();