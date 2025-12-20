import ApiClient from "../ApiClient.js"
export const getAllCrimeLocation = async () =>{
 try{
    const res = await ApiClient.get('/map/getAllCrimeLocation')
    return {success : true, data : res.data}
 }
 catch(err){
    throw err
 }
}