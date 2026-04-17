import   mongoose  from "mongoose";

const ConnectDb = async()=>{
    try{
        await mongoose.connect( `${process.env.MONGO_URI}E_Commerce`)
        console.log('MongoDB connected successfully');
        
    }catch(error){
        console.log("mongodb Connection fails:", error);
        
    }
}

export default ConnectDb;