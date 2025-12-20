import ApiClient from "../ApiClient";
export const fetchuser = async () => {
  try {
    const res = await ApiClient.get("/auth/checkUser");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.response?.data || err.message };
  }
};
