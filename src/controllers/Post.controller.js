import { data } from "react-router-dom";
import ApiClient from "../ApiClient";
export const getAllPosts = async () => {
  try {
    const res = await ApiClient.get("/post/getAllPosts");

    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data || err.message };
  }
};

export const getPostById = async (id) => {
  try {
    const res = await ApiClient.get("/post/getPostById" ,{
      params: { id },
    });
    return { success: true, data: res.data };
  } catch (err) {
    throw err;
  }
};

export const addPost = async (data)=>{
  try{
    const res = await ApiClient.post('/post/addPost' , data,{
      headers: {
        "Content-Type" :"multipart/form-data",
      },
    })
    return {success : true , data : res.data}
  }
  catch(err){
    throw err
  }
}

export const likePost = async (postId) =>{
  try{
      const res = await ApiClient.post(`/post/like/${postId}`)
      return {success : true , data : res.data}
  }
  catch(err){
    throw err
  }
}
  

export const downVotePost = async (postId) =>{
  try{
      const res = await ApiClient.post(`/post/downvote/${postId}`);
      return {success : true , data : res.data}
  }
  catch(err){
    throw err
  }
}
  
export const addComment = async (data) =>{
  try{
    const res = await ApiClient.post('/post/add-comment' , data)
    return {success : true , data: res.data}
  }
  catch(err){
    throw err
  }
}

export const removeComment = async (commentId, postId) => {
  try {
    const res = await ApiClient.delete(
      `/post/delete-comment/${commentId}?postId=${postId}`
    );
    return { success: true, data: res.data };
  } catch (err) {
    throw err;
  }
};

export const removePost = async (id)=>{
  try{
    const res = await ApiClient.delete(`/post/delete-post/${id}`)
    return {success : true, data : res.data}
  }
  catch(err){
    throw err
  }
}
export const editPost = async (data)=>{
  try{
    for (let [keys,values] of data.entries()){
      console.log(keys, values);
    }
    const res = await ApiClient.post('/post/edit-post',data,{
      headers: {
        "Content-Type" :"multipart/form-data",
      },
    })
    return {success : true, data : res.data}
  }
  catch(err){
    throw err
  }
}
 