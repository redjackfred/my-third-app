import "./App.css";
import React, { useState, useEffect } from "react";
import lines from "./phrases.txt";
import HiddenPhrase from "./newjs.js";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import axios from "axios";

const wheel = {
  name: "Wheel of Fortune",
  imageUrl:
    "https://th.bing.com/th/id/R.7aaa80c6b1e485dfbf78cd3ef42bfa87?rik=mfQefEIDV7KATg&riu=http%3a%2f%2fwww.villages-news.com%2fwp-content%2fuploads%2f2017%2f11%2fWheel-of-Fortune.jpg&ehk=FnDfGwpdIYoMKnZ9PKlhNb%2fY3J0fLBjY43PqhQYb7m0%3d&risl=&pid=ImgRaw&r=0",
  imageSize: 120,
};

function GuessInput({ onGuess }) {
  const [guess, setGuess] = useState("");

  function handleGuessChange(event) {
    setGuess(event.target.value);
  }

  function handleGuessSubmit(event) {
    event.preventDefault();
    onGuess(guess);
    setGuess("");
  }

  return (
    <form onSubmit={handleGuessSubmit}>
      <label>
        Guess a letter:
        <input type="text" value={guess} onChange={handleGuessChange} />
      </label>
      <button type="submit">Enter</button>
    </form>
  );
}

function GuessesLeft({ guessesLeft }) {
  return <h4 className="Guesses-Left">Guesses Left: {guessesLeft}</h4>;
}

function PlayAgainButton({ onClick }) {
  return (
    <button
      className="PlayAgainButton"
      onClick={onClick}
      style={{ marginTop: "20px" }}
    >
      Play
    </button>
  );
}

function App() {
  const [phrases, setPhrases] = useState([]);
  const [randomPhrase, setRandomPhrase] = useState("");
  const [revealedPhrase, setRevealedPhrase] = useState("");
  const [guessesLeft, setGuessesLeft] = useState(6);
  const [userId, setUserId] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userHandle, setUserHandle] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [gameRecords, setGameRecords] = useState([]);
  const [isShowHighScores, setIsShowHighScores] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStart, setIsStart] = useState(false);
  const [previousGuesses, setPreviousGuesses] = useState([]);
  const apiURL = "https://wheeloffortunegamerecords.uc.r.appspot.com/";
  const firebaseConfig = {
    apiKey: "AIzaSyA6Czx8Ur6nmjfeo3FSVq9m_ZmeDyKbliA",
    authDomain: "wheeloffortunereact.firebaseapp.com",
    projectId: "wheeloffortunereact",
    storageBucket: "wheeloffortunereact.appspot.com",
    messagingSenderId: "869855642680",
    appId: "1:869855642680:web:394706e5eb7763598d92cd",
  };
  const app = initializeApp(firebaseConfig);
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth(app);
    signInWithRedirect(auth, provider)
      .then((result) => {
        // User signed in
        console.log(result.user);
      })
      .catch((error) => {
        // Handle Errors here.
        console.error(error);
      });
  };

  const auth = getAuth(app);

  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (!userLoggedIn && user) {
        // User is signed in.
        console.log("User is signed in:", user);
        //document.querySelector(".book-list").style.display="block";
        setUserId(user.uid);
        setUserDisplayName(user.displayName);
        console.log("User ID: " + user.uid);
        setUserLoggedIn(true);
        console.log(userLoggedIn);
      }
    });
  }, []);

  useEffect(() => {
    getScores();
  }, []);

  const HandleChange = () => {
    const handleSubmit = (event) => {
      const formData = new FormData(event.currentTarget);
      event.preventDefault();
      for (let [key, value] of formData.entries()) {
        console.log(key, value);     
        setUserHandle(value);   
      }
    };

    return (
      <div>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Handle" />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  };

  function Login() {
    return (
      <div>
        {userId === "" ? (
          <div
            className="col s12 m6 offset-m3 center-align"
            onClick={signInWithGoogle}
          >
            <link
              rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-beta/css/materialize.min.css"
            ></link>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-beta/js/materialize.min.js"></script>
            <div className="oauth-container btn darken-4 white black-text">
              <div className="left">
                <img
                  width="30px"
                  alt="Google sign-in"
                  src="https://clipartcraft.com/images/google-logo-png.png"
                />
              </div>
              Login with Google
            </div>
          </div>
        ) : (
          <div>
            <p>Hello {(userHandle == null)||(userHandle == "") ? userDisplayName : userHandle}</p>
          </div>
        )}
      </div>
    );
  }

  useEffect(() => {
    fetch(lines)
      .then((response) => response.text())
      .then((data) => {
        const phrasesArray = data.split("\n");
        setPhrases(phrasesArray);
      });
  }, []);

  function handleGuess(guess) {
    let newRevealedPhrase = "";
    let correctGuess = false;
    let isDuplicatedGuess = false;

    if (previousGuesses.includes(guess.toLowerCase())) {
      alert("Guess new characters");
      isDuplicatedGuess = true;
    } else {
      setPreviousGuesses((prev) => {
        return [...prev, guess.toLowerCase()];
      });
    }

    for (let i = 0; i < randomPhrase.length; i++) {
      if (randomPhrase[i].toLowerCase() === guess.toLowerCase()) {
        newRevealedPhrase += randomPhrase[i];
        correctGuess = true;
      } else if (!randomPhrase[i].match(/[A-Za-z]/i)) {
        newRevealedPhrase += randomPhrase[i];
      } else {
        newRevealedPhrase += revealedPhrase[i] || "*";
      }
    }    
    setRevealedPhrase(newRevealedPhrase);

    if (!correctGuess && !isDuplicatedGuess) {
      setGuessesLeft(guessesLeft - 1);
    }
  }

  function handlePlayAgain() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    if (
      (randomPhrase === revealedPhrase || guessesLeft === 0) &&
      randomPhrase !== ""
    ) {
      saveScore(guessesLeft, userDisplayName, userHandle);
    }
    setRandomPhrase(phrases[randomIndex]);
    setRevealedPhrase("");
    setGuessesLeft(6);
    setPreviousGuesses([]);
    setIsStart(true);
  }

  function handlePlayAgainWithoutSaving() {
    const randomIndex = Math.floor(Math.random() * phrases.length);    
    setRandomPhrase(phrases[randomIndex]);
    setRevealedPhrase("");
    setGuessesLeft(6);
    setPreviousGuesses([]);
  }


  async function deleteById(props){
    console.log("in function:"+props);
    await axios.delete(apiURL + props)
      .then(response => {        
        setLoading(false); 
        getScores(); 
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });   
  }


  

  async function getScores() {
    await axios
      .get(apiURL + "findAllGameRecords")
      .then((response) => {
        setGameRecords(response.data); // Axios packs the response in a 'data' property
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }

  async function saveScore(score, playerId, handle) {
    score *= score;
    const postData = {
      score,
      playerId,
      handle,
    };
    console.log(
      postData.score + "," + postData.playerId + "," + postData.handle
    );

    try {
      const response = await axios.post(apiURL + "saveGameRecord", postData);
      console.log("Response:", response.data);
      getScores();
    } catch (error) {
      console.error("Error posting data:", error);
    }
  }

  function RecordList() {
    return (
      <div>
        {isShowHighScores ? (
          <div>
            {gameRecords
              .sort(
                ({ score: previousScore }, { score: currentScore }) =>
                  currentScore - previousScore
              )
              .map((gameRecord) => (
                <div>
                  <p style={{ display: "inline-block", marginRight: "20px" }}>
                    {gameRecord.handle == "" || gameRecord.handle == null
                      ? gameRecord.playerId
                      : gameRecord.handle}{" "}
                    : {gameRecord.score}{" "}
                  </p>
                  <button onClick={function(){              
                    deleteById(gameRecord.id);
                    console.log("Delete id: " + gameRecord.id);}} name='delete'>Delete</button>                 
                </div>
              ))}
          </div>
        ) : (
          <div>
            {gameRecords
              .sort(
                ({ id: previousId }, { id: currentId }) =>
                  previousId - currentId
              )
              .filter((gr) => {
                if (gr.handle != null || gr.handle != "") {
                  return gr.handle === userHandle;
                } else {
                  return gr.playerId === userDisplayName;
                }
              })
              .map((gameRecord) => (
                <div>
                  <p style={{ display: "inline-block", marginRight: "20px" }}>
                    {gameRecord.handle == "" || gameRecord.handle == null
                      ? gameRecord.playerId
                      : gameRecord.handle}{" "}
                    : {gameRecord.score}{" "}
                  </p>
                  <button onClick={function(){              
                    deleteById(gameRecord.id);
                    console.log("Delete id: " + gameRecord.id);}} name='delete'>Delete</button>    
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={wheel.imageUrl} className="App-logo" alt="logo" />
        <p>Welcome to {wheel.name}!</p>
        <Login />
      </header>
      <main>
        <HandleChange />
        {isStart?null:<PlayAgainButton onClick={handlePlayAgain} />}        
        {randomPhrase && (
          <div>
            <HiddenPhrase phrase={revealedPhrase} />
            <GuessesLeft guessesLeft={guessesLeft} />
            {guessesLeft > 0 ? (
              randomPhrase === revealedPhrase ? (
                <div>
                  <h1 className="You-Win">You Win!</h1>
                  <button onClick={handlePlayAgain}>Save Record</button>
                  <button onClick={handlePlayAgainWithoutSaving}>Don't save</button>                  
                </div>
              ) : (
                <GuessInput onGuess={handleGuess} />
              )
            ) : (
              <p>Game Over</p>
            )}
          </div>
        )}
      </main>
      <h3>Your Scores</h3>
      <div>
        <label>
          <input
            type="checkbox"
            value="showHighScores"
            onChange={() => {
              setIsShowHighScores(!isShowHighScores);
            }}
          />
          Show High Scores
        </label>
      </div>
      <RecordList />
    </div>
  );
}

export default App;
