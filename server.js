import express from "express";
import fetch from "node-fetch";

const app = express();



app.set("views", "./views");
app.set("view engine", "pug");
//app.set("view engine", "html");
app.use(express.static("public"));




const redirect_uri = "http://localhost:3000/callback";
const client_id = "022f1b89408c445784a6366ca1e28a16";
const client_secret = "cf6062eddf494a1aabbc98a126491f97";

global.access_token;

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/authorize", (req, res) => {
  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: "022f1b89408c445784a6366ca1e28a16",
    scope: ["user-library-read", "user-library-modify","playlist-modify-private","playlist-modify-public","playlist-read-private"],
    redirect_uri: "http://localhost:3000/callback",
  });

  res.redirect(
    "https://accounts.spotify.com/authorize?" + auth_query_parameters.toString()
  );
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  var body = new URLSearchParams({
    code: code,
    redirect_uri: redirect_uri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "post",
    body: body,
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
  });

  const data = await response.json();
  global.access_token = data.access_token;

  res.redirect("/dashboard");
});

async function getData(endpoint) {
  const response = await fetch("https://api.spotify.com/v1" + endpoint, {
    method: "get",
    headers: {
      Authorization: "Bearer " + global.access_token,
    },
  });

  const data = await response.json();
  return data;
}

// async function getSearch(input) {
//   const response = await fetch("https://api.spotify.com/v1/search?q=" + input + "&type=album", {
//     method: "get",
//     headers: {
//       Authorization: "Bearer " + global.access_token,
//     },
//   });
  
//   const data = await response.json();
//   return data;
// }
 


app.get("/dashboard", async (req, res) => {
  //const userInfo = await getData("/me");
  //const tracks = await getData("/me/tracks?limit=10");
  //const albums = await getSearch(input);
  res.render("dashboard");
 // res.json("this");
  
});


app.get("/results", async (req, res) => {
 // extract json opject
 // make call to search api
 // return json 
 var albumName = req.query.name;
 const response = await fetch("https://api.spotify.com/v1/search?q=" + albumName + "&type=album", {
  method: "get",
  headers: {
    Authorization: "Bearer " + global.access_token,
  },
});

const data = await response.json();
 res.json(data)

//res.json(req.body)
// var payload = req.payload   // <-- this is the important line

//     res.json({"output": payload})
  
});

// make another app.get

app.get("/recommendations", async (req, res) => {
  const artist_id = req.query.artist;
  const track_id = req.query.track;

  const params = new URLSearchParams({
    seed_artist: artist_id,
    seed_genres: "rock",
    seed_tracks: track_id,
  });

  const data = await getData("/recommendations?" + params);
  res.render("recommendation", { tracks: data.tracks });
});

let listener = app.listen(3000, function () {
  console.log(
    "Your app is listening on http://localhost:" + listener.address().port
  );
});
