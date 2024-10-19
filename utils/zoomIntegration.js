const axios = require("axios");
const jwt = require("jsonwebtoken");
const ApiError = require("./ApiError");

const CLIENT_ID = "xHaiJHGpRkWizOL0QRHauA";
const CLIENT_SECRET = "72P8vZIElHdQWiTmOnY6KIk1AbBCzGtj";
const ACCOUNT_ID = "IbHRxHdFRkGSERx06nVIPQ";

async function getAccessToken() {
  try {
    const response = await axios.post("https://zoom.us/oauth/token", null, {
      params: {
        grant_type: "account_credentials",
        account_id: ACCOUNT_ID,
      },
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, error.response.data.message);
  }
}

async function createZoomMeeting(hostEmail, topic, startTime, duration) {
  const token = await getAccessToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const meetingDetails = {
    topic: topic,
    type: 2,
    start_time: startTime,
    duration: duration,
    timezone: "UTC",
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true,
      mute_upon_entry: true,
    },
  };

  try {
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${hostEmail}/meetings`,
      meetingDetails,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Zoom meeting:", error.response.data);
    throw new ApiError(500, error.response.data.message);
  }
}

const deleteMeeting = async (meetingId) => {
  const token = await getAccessToken();
  const options = {
    method: "DELETE",
    url: `https://api.zoom.us/v2/meetings/${meetingId}`,
    headers: {
      Authorization: `Bearer ${token}`, 
      "Content-Type": "application/json",
    },
  };

  try {
    const data = await axios.request(options);
    return data;
  } catch (error) {
    throw new ApiError(500,error.response.data.message)
  }
};

module.exports={getAccessToken,createZoomMeeting,deleteMeeting}
