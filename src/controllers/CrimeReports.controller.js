import ApiClient from "../ApiClient.js"
export const getAllCrimeReports = async () =>{
 try{
    const res = await ApiClient.get('/crimeReports/getAllCrimeReports')
    return {success : true, data : res.data}
 }
 catch(err){
    throw err
 }
}