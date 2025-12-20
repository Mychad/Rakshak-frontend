import ApiClient from "../ApiClient";

export const getUserProfile = async (id) => {
  try {
    const res = await ApiClient.get(`/profile/getUserProfile/${id}`);
    return { success: true, data: res.data };
  } catch (err) {
    throw err;
  }
};
export const getUserProfileWithUser = async () => {
  try {
    const res = await ApiClient.get(`/profile/getUserProfile`);
    return { success: true, data: res.data };
  } catch (err) {
    throw err;
  }
};

export const editProfile = async (data,file) => {
  try {
      const fd = new FormData();
  fd.append("id", data._id);
  if (typeof data.name !== "undefined") fd.append("name", data.name);
  if (typeof data.username !== "undefined") fd.append("username", data.username);
  if (typeof data.bio !== "undefined") fd.append("bio", data.bio);
  // only include actual file, not base64 preview
  if (file) fd.append("profilePic", file);

    const res = await ApiClient.put(`/profile/edit-profile`, fd,
      {
      headers: {
      "Content-Type": "multipart/form-data",
    }
  },);
    return { success: true, data: res.data };
  } catch (err) {
    throw err;
  }
};
