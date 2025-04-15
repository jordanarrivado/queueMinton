import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "./AuthContext";
//import rateLimit from 'axios-rate-limit';
import "./index.css";

import "./Css/topMobile.css";
import "./Css/App.css";
import "./Css/addplayer.css";
import "./Css/shuffle.css";
import "./Css/custom.css";
import "./Css/concourt.css";
import "./Css/matchmaking.css";
import "./Css/queue.css";
import "./Css/gameMode.css";
import "./Css/selectInfo.css";
import "./Css/payment.css";
import "./Css/history.css";
import "./Css/playerHistory.css";
import "./Css/title.css";
import "./Css/toggle.css";
import "./Css/dashboard.css";
import "./Css/schedule.css";
import "./Css/addArea.css";
import "./Css/account.css";
import "./Css/end.css";
import "./Css/settings.css";
import "./Css/liveView2.css";
import "./Css/arrowBtn.css";
import "./Css/courtNmatch.css";
import "./Css/paymentNqueue.css";
import "./Css/historyNplayerHis.css";
import "./Css/addAreaNselectInfo.css";
import "./Css/dashNsched.css";

import "./mediaQuery.css";

import TopWeb from "./components/topWeb";
import Nav from "./components/left/nav";
import Live from "./components/liveView2";
import TopMobile from "./components/top/topMobile";
import CourtNmatch from "./components/courtNmatch";
import PaymentNqueue from "./components/paymentNqueue";
import HistoryNplayerHis from "./components/historyNplayerHis";
import AddAreaNselectInfo from "./components/addAreaNselectInfo";
import DashNsched from "./components/dashNsched";

import Dashboard from "./components/dashboard";
import Schedule from "./components/schedule";
import AddArea from "./components/addArea";
import GameMode from "./components/gameMode";
import SelectInfo from "./components/selectInfo";
import AddPlayer from "./components/addPlayer";
import CourtCon from "./components/courtCon";
import Shuffle from "./components/shuffle";
import Custom from "./components/custom";
import CustomMatch from "./components/CustomMatch";
import MatchMaking from "./components/matchMaking";
import Queue from "./components/queue";
import Payment from "./components/payment";
import History from "./components/history";
import PlayerHistory from "./components/playersHistory";
import Settings from "./components/settings";
import PacmanLoader from "react-spinners/PacmanLoader";
//import ParticlesBackground from './components/particleBackground.js';
import ArrowBtn from "./components/arrowBtn";

import { io } from "socket.io-client";

const socket = io.connect("wss://212.85.25.203:3001", {
  transports: ["websocket"],
});

//const http = rateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000 });

function App() {
  const [players, setPlayers] = useState([]);
  const [courtFeeTypeDis, setCourtFeeTypeDis] = useState("");
  const [playerHistory, setPlayerHistory] = useState([]);
  const [matches, setMatches] = useState([]);
  const [inMatch, setInMatch] = useState([]);
  const [courts, setCourts] = useState([]);
  const [forDisplay, setForDisplay] = useState([]);
  const [totalRev, setTotalRev] = useState(0);
  const [historyArea, setHistoryArea] = useState([]);
  //const [sessionData, setSessionData ] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState({
    player1: "",
    player2: "",
    player3: "",
    player4: "",
  });
  const [selectedComponent, setSelectedComponent] =
    useState("displayDashboard"); //allComponent
  const [selectedComponentMobile, setSelectedComponentMobile] = useState(
    "displayDashboardMobile"
  );
  const [showCustom, setShowCustom] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedBall, setSelectedBall] = useState("");
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [mode, setMode] = useState("");
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [activeComponent, setActiveComponent] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [sessions, setSessions] = useState([]);
  const [click, setClick] = useState("mainTb");
  const [displayPlayers, setDisplayPlayers] = useState([]);
  const [selectedAreaHistory, setSelectedAreaHistory] = useState(null);
  const availableBalls = [
    { id: 0, name: "Used Ball", count: 0 },
    { id: 1, name: "New Ball", count: 1 },
  ];
  const [playerLoading, setPlayerLoading] = useState(true);
  const [courtLoading, setCourtLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [formattedTime, setFormattedTime] = useState("");
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    location: selectedArea,
  });
  const [textCode, setTextCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [reqToJoin, setReqToJoin] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const sessionDate = localStorage.getItem("Session");
    const localArea = localStorage.getItem("LocalArea");
    const userEmail = user?.email;

    if (!userEmail || !localArea || !sessionDate) return;

    const encodedSessionDate = encodeURIComponent(sessionDate);

    socket.emit("getReqToJoin", {
      userEmail,
      areaName: localArea,
      sessionDate: encodedSessionDate,
    });

    const handleReqToJoinData = (data) => {
      setReqToJoin(data.playerReqList);
    };

    const handleReqToJoinError = (error) => {
      console.error("Socket Error:", error);
    };

    socket.on("reqToJoinData", handleReqToJoinData);
    socket.on("reqToJoinError", handleReqToJoinError);

    return () => {
      socket.off("reqToJoinData", handleReqToJoinData);
      socket.off("reqToJoinError", handleReqToJoinError);
    };
  }, []);

  useEffect(() => {
    const sessionDate = localStorage.getItem("Session");
    const localArea = localStorage.getItem("LocalArea");

    if (!sessionDate || !localArea) {
      console.warn("Session date or local area not found in localStorage.");
      setLoading(false);
      return;
    }

    if (!isVisible) return;

    const encodedSessionDate = encodeURIComponent(sessionDate);
    const encodedLocalArea = encodeURIComponent(localArea);

    socket.emit("getReqToJoin", {
      userEmail: user.email,
      areaName: encodedLocalArea,
      sessionDate: encodedSessionDate,
    });
  }, [isVisible]);

  useEffect(() => {
    const total = playerHistory
      .flatMap(
        (player) =>
          player.transactions?.map((transaction) => transaction.totalPaid) || []
      )
      .reduce((acc, amount) => acc + amount, 0);

    setTotalRev(total);
    //console.log(totalRev);
  }, [playerHistory]);

  const [theme, setTheme] = useState("");
  const { user, logout } = useAuth();

  const handleNavigationClick = (component) => {
    setSelectedComponent(component);
  };

  const handleToggle = () => {
    setIsChecked((prev) => {
      console.log("Toggle state: ", !prev);
      return !prev;
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      setIsChecked(savedTheme === "checked");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isChecked ? "checked" : "");
    document.documentElement.setAttribute(
      "data-theme",
      isChecked ? "checked" : ""
    );
  }, [isChecked]);

  useEffect(() => {
    setSessionStart(localStorage.getItem("Session"));
    //console.log();
  }, [sessionStart, activeComponent]);

  useEffect(() => {
    const gameMode = localStorage.getItem("GameMode");
    const localArea = localStorage.getItem("LocalArea");
    const session = localStorage.getItem("Session");

    const displayData = session && localArea && gameMode;

    if (displayData) {
      setSelectedComponent("allComponent");
      setSelectedComponentMobile("M&A");
      setLoading(false);
    }
  }, []);

  /*
  useEffect(() => {
    const sessionDate = localStorage.getItem("Session");
    const areaName = localStorage.getItem("LocalArea");

    if (!sessionDate || !areaName || !user?.email) {
      console.warn("Missing session date, area, or user email.");
      setLoading(false);
      return;
    }

    const encodedDate = encodeURIComponent(sessionDate);

    const startTime = Date.now(); // Add a timestamp here

    const handleDataFetched = (data) => {
      const endTime = Date.now(); // Capture the time when the data is fetched
      console.log(`Data fetched in ${endTime - startTime}ms`);

      setSchedules(data.schedules);
      setPlayers(data.players);
      setPlayerHistory(data.playerHistory);
      setMatches(data.matches);
      setInMatch(data.inMatch);
      setCourts(data.courts);
      setLoading(false);
      setCourtLoading(false);
    };

    const handleSocketError = (error) => {
      console.error("Socket error during fetchData:", error);
      Swal.fire({
        icon: "error",
        title: "Error fetching data",
        text: "There was an issue fetching the session data.",
      });
      setLoading(false);
    };

    socket.emit("fetchData", {
      userEmail: user.email,
      areaName,
      sessionDate: encodedDate,
    });

    socket.on("dataFetched", handleDataFetched);
    socket.on("error", handleSocketError);

    return () => {
      socket.off("dataFetched", handleDataFetched);
      socket.off("error", handleSocketError);
    };
  }, [user?.email, socket, inMatch, matches, players, playerHistory, courts]);

  */

  useEffect(() => {
    const localArea = localStorage.getItem("LocalArea");

    if (!user?.email || !localArea || !socket) {
      console.warn("Missing user, area, or socket.");
      setCourtLoading(false);
      return;
    }

    setCourtLoading(true);

    // Emit the request
    socket.emit("fetchCourts", {
      userEmail: user.email,
      areaName: localArea,
    });

    // Handle the response
    const handleCourtsFetched = (data) => {
      setCourts(data || []);
      setCourtLoading(false);
    };

    const handleError = (err) => {
      console.error("Socket error while fetching courts:", err);
      setCourtLoading(false);
    };

    socket.on("courtsFetched", handleCourtsFetched);
    socket.on("error", handleError);

    // Cleanup
    return () => {
      socket.off("courtsFetched", handleCourtsFetched);
      socket.off("error", handleError);
    };
  }, [user?.email, socket, setCourts, setCourtLoading]);

  const handleAddMatch = async (
    e,
    match,
    selectedCourt,
    selectedBall,
    courts
  ) => {
    if (e) {
      e.preventDefault();
    }

    console.log("Selected Ball:", selectedBall);

    const sessionDate = localStorage.getItem("Session");
    const localArea = localStorage.getItem("LocalArea");

    if (!selectedCourt) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select a Court",
      });
      setMatchLoading(false);
      setCourtLoading(false);
      return;
    }

    if (selectedBall !== 0 && selectedBall !== 1) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select a Ball",
      });
      setMatchLoading(false);
      setCourtLoading(false);
      return;
    }

    const court = courts.find((court) => court.name === selectedCourt);
    if (!court) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Selected court not found",
      });
      setMatchLoading(false);
      setCourtLoading(false);
      return;
    }
    setMatchLoading(true);
    setCourtLoading(true);

    try {
      const matchId = match._id;
      const encodedSessionDate = encodeURIComponent(sessionDate);
      const existingMatch = court.addMatches.some((e) => e.length > 0);

      if (existingMatch) {
        Swal.fire({
          icon: "info",
          title: "Notice",
          text: "Court not available at the moment. Please select another.",
        });
        return;
      }
      const courtRes = await axios.put(
        `http://212.85.25.203:3001/users/${user.email}/areas/${localArea}/courts/${court._id}/addMatches`,
        { matchId }
      );

      const updatedCourt = courtRes.data;

      setCourts(courts.map((c) => (c._id === court._id ? updatedCourt : c)));
      setMatches(
        matches.map((existingMatch) =>
          existingMatch._id === matchId
            ? { ...existingMatch, court: updatedCourt }
            : existingMatch
        )
      );

      const allPlayerIds = [...match.team1, ...match.team2];
      if (selectedBall !== null) {
        await Promise.all(
          allPlayerIds.map(async (playerId) => {
            try {
              const addPlayerBallRes = await axios.put(
                `http://212.85.25.203:3001/users/${user.email}/areas/${localArea}/sessions/${encodedSessionDate}/players/${playerId}/addBall`,
                { ball: selectedBall }
              );
              const updatedPlayer = addPlayerBallRes.data;

              setPlayers((prevPlayers) =>
                prevPlayers.map((player) =>
                  player._id === updatedPlayer._id ? updatedPlayer : player
                )
              );
            } catch (error) {
              console.error(
                `Error updating ball for player ${playerId}:`,
                error.response?.data || error.message
              );
              Swal.fire({
                icon: "error",
                title: "Error",
                text: `Failed to update ball for player ${playerId}.`,
              });
            }
          })
        );
      }

      setMatchLoading(false);
      setCourtLoading(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Match Added successfully",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error adding match to court",
      });
      console.error("Error adding match to court:", error);
      setMatchLoading(false);
      setCourtLoading(false);
    }
  };

  const convertToTime = (timeQueue) => {
    if (!timeQueue || typeof timeQueue !== "string") return new Date(0);

    const parts = timeQueue.split(" ");
    if (parts.length < 2) return new Date(0);

    const [time, period] = parts;
    let [hours, minutes, seconds = "00"] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return new Date(0);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return new Date(
      `1970-01-01T${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`
    );
  };

  const generateRandomMatch = async () => {
    console.log("Court:", courts);
    console.log("Player:", players);
    console.log("inMatch:", inMatch);
    console.log("matches:", matches);

    setLoading(true);
    try {
      const standByData = JSON.parse(localStorage.getItem("standBy") || "[]");
      const sessionDate = localStorage.getItem("Session");
      const localArea = localStorage.getItem("LocalArea");
      let usedPairs = JSON.parse(localStorage.getItem("usedPairs") || "[]");

      if (!sessionDate || !localArea) {
        Swal.fire({
          icon: "warning",
          title: "Missing Data",
          text: "Session date or local area not found.",
        });
        setLoading(false);
        return;
      }

      const standByPlayerIds = new Set(standByData.map((player) => player.id));
      const availablePlayers = players.filter(
        (player) => !standByPlayerIds.has(player._id)
      );
      console.log(availablePlayers);
      if (availablePlayers.length < 4) {
        Swal.fire({
          icon: "error",
          title: "Not Enough Players",
          text: "You need at least 4 players to generate matches.",
        });
        setLoading(false);
        return;
      }

      if (inMatch.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Incomplete Matches",
          text: "Complete the remaining games first.",
        });
        setLoading(false);
        return;
      }

      if (courts.length < 1) {
        Swal.fire({
          icon: "warning",
          title: "Court Required",
          text: "Please add a court first to generate matches!",
        });
        setLoading(false);
        return;
      }

      const encodedSessionDate = encodeURIComponent(sessionDate);
      const encodedLocalArea = encodeURIComponent(localArea);

      /* const { data: allMatches } = await axios.get(
        `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/matches`
      );*/
      const allMatches = matches;

      const allTeamPairs = new Set([
        ...usedPairs,
        ...allMatches.flatMap((match) => [
          JSON.stringify(match.team1.sort()),
          JSON.stringify(match.team2.sort()),
        ]),
      ]);

      const requiredPlayers = Math.min(
        availablePlayers.length,
        4 * Math.floor(availablePlayers.length / 4)
      );

      const playerQueue = availablePlayers
        .filter((player) => !standByPlayerIds.has(player._id))
        .sort((a, b) => convertToTime(a.timeQueue) - convertToTime(b.timeQueue))
        .slice(0, requiredPlayers);

      const sortedPlayers = [...playerQueue].sort((a, b) => {
        const aScore = (a.win || 0) + (a.loss || 0);
        const bScore = (b.win || 0) + (b.loss || 0);
        return aScore - bScore;
      });

      const serializeTeam = (team) =>
        JSON.stringify(team.map((player) => player._id).sort());

      const shuffledPlayers = [...sortedPlayers].sort(
        () => Math.random() - 0.5
      );
      const newMatches = [];
      const matchesToGenerate = Math.floor(shuffledPlayers.length / 4);

      for (let i = 0; i < matchesToGenerate; i++) {
        if (shuffledPlayers.length < 4) break;

        let team1,
          team2,
          attempts = 0;
        const maxAttempts = 10;

        do {
          team1 = shuffledPlayers.splice(0, 2);
          team2 = shuffledPlayers.splice(0, 2);
        } while (
          !isUniquePairing(team1, team2, allTeamPairs) &&
          attempts < maxAttempts
        );

        if (attempts >= maxAttempts) {
          console.warn(
            "Max attempts reached, skipping further match generation."
          );
          break;
        }

        allTeamPairs.add(serializeTeam(team1));
        allTeamPairs.add(serializeTeam(team2));

        const matchData = {
          name: `Match ${newMatches.length + 1}`,
          team1: team1.map((player) => player._id),
          team2: team2.map((player) => player._id),
        };

        const matchResponse = await axios.put(
          `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/matches`,
          matchData
        );

        await axios.put(
          `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/inMatch`,
          matchData
        );
        newMatches.push(matchResponse.data);
      }

      localStorage.setItem("usedPairs", JSON.stringify([...allTeamPairs]));

      const [playersResponse, matchesResponse] = await Promise.all([
        players,
        matches,
        /*
        axios.get(
          `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/players`
        ),
        axios.get(
          `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/matches`
        ),
        */
      ]);

      setPlayers(playersResponse.data);
      setMatches(matchesResponse.data);

      Swal.fire({
        icon: "success",
        title: "Matches Generated",
        text: `${newMatches.length} matches generated successfully!`,
      });
    } catch (error) {
      console.error(
        "Error generating matches:",
        error.message || error.response?.data
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while generating matches.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateClassicMatch = async () => {
    setLoading(true);

    try {
      const standByData = JSON.parse(localStorage.getItem("standBy") || "[]");
      const sessionDate = localStorage.getItem("Session");
      const localArea = localStorage.getItem("LocalArea");
      let usedPairs = JSON.parse(localStorage.getItem("usedPairs") || "[]");

      if (!sessionDate || !localArea) {
        Swal.fire({
          icon: "warning",
          title: "Missing Data",
          text: "Session date or local area not found.",
        });
        return;
      }

      const standByPlayerIds = new Set(standByData.map((player) => player.id));
      const availablePlayers = players.filter(
        (player) => !standByPlayerIds.has(player._id)
      );

      if (availablePlayers.length < 4) {
        Swal.fire({
          icon: "error",
          title: "Not Enough Players",
          text: "You need at least 4 players to generate matches.",
        });
        return;
      }

      if (inMatch.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Incomplete Matches",
          text: "Complete the remaining games first.",
        });
        return;
      }

      if (courts.length < 1) {
        Swal.fire({
          icon: "warning",
          title: "Court Required",
          text: "Please add a court first to generate matches!",
        });
        return;
      }

      const encodedSessionDate = encodeURIComponent(sessionDate);
      const encodedLocalArea = encodeURIComponent(localArea);

      const allMatches = matches || [];

      const allTeamPairs = new Set([
        ...usedPairs,
        ...allMatches.flatMap((match) =>
          [
            match.team1 ? JSON.stringify(match.team1.sort()) : null,
            match.team2 ? JSON.stringify(match.team2.sort()) : null,
          ].filter(Boolean)
        ),
      ]);

      const serializeTeam = (team) =>
        JSON.stringify(team.map((player) => player._id).sort());

      const isLevelCompatible = (level1, level2) => {
        const levels = ["A", "B", "C", "D"];
        const diff = Math.abs(levels.indexOf(level1) - levels.indexOf(level2));
        return diff <= 1;
      };

      const groupPlayersByLevel = (players) => {
        const groups = {};
        players.forEach((player) => {
          if (!groups[player.level]) {
            groups[player.level] = [];
          }
          groups[player.level].push(player);
        });
        return groups;
      };

      const findMatch = (players, allPairs) => {
        let team1 = null;
        let team2 = null;

        for (let i = 0; i < players.length - 3; i++) {
          for (let j = i + 1; j < players.length; j++) {
            if (players[i]._id === players[j]._id) continue;
            const candidateTeam1 = [players[i], players[j]];

            for (let k = j + 1; k < players.length - 1; k++) {
              for (let l = k + 1; l < players.length; l++) {
                if (
                  players[k]._id === players[l]._id ||
                  candidateTeam1.some(
                    (p) => p._id === players[k]._id || p._id === players[l]._id
                  )
                )
                  continue;

                const candidateTeam2 = [players[k], players[l]];
                const pair1 = serializeTeam(candidateTeam1);
                const pair2 = serializeTeam(candidateTeam2);

                if (
                  isLevelCompatible(players[i].level, players[j].level) &&
                  isLevelCompatible(players[k].level, players[l].level) &&
                  !allPairs.has(pair1) &&
                  !allPairs.has(pair2)
                ) {
                  team1 = candidateTeam1;
                  team2 = candidateTeam2;
                  allPairs.add(pair1);
                  allPairs.add(pair2);
                  return { team1, team2 };
                }
              }
            }
          }
        }
        return { team1, team2 };
      };

      const levelGroups = groupPlayersByLevel(availablePlayers);
      const newMatches = [];

      for (const level in levelGroups) {
        const group = levelGroups[level];
        const shuffledGroup = group.sort(() => Math.random() - 0.5);

        while (shuffledGroup.length >= 4) {
          const { team1, team2 } = findMatch(shuffledGroup, allTeamPairs);

          if (!team1 || !team2) break;

          const team1Ids = team1.map((p) => p._id);
          const team2Ids = team2.map((p) => p._id);

          const remainingPlayers = shuffledGroup.filter(
            (p) => !team1Ids.includes(p._id) && !team2Ids.includes(p._id)
          );

          shuffledGroup.splice(0, shuffledGroup.length, ...remainingPlayers);

          const matchData = {
            name: `Match ${newMatches.length + 1}`,
            team1: team1Ids,
            team2: team2Ids,
          };

          const matchResponse = await axios.put(
            `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/matches`,
            matchData
          );

          await axios.put(
            `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/inMatch`,
            matchData
          );

          newMatches.push(matchResponse.data);
        }
      }

      if (newMatches.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Matches Generated",
          text: "No compatible matches could be generated.",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Matches Generated",
          text: `${newMatches.length} matches generated successfully!`,
        });
      }

      localStorage.setItem("usedPairs", JSON.stringify([...allTeamPairs]));

      const [playersResponse, matchesResponse] = await Promise.all([
        axios.get(
          `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/players`
        ),
        axios.get(
          `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/matches`
        ),
      ]);

      setPlayers(playersResponse.data);
      setMatches(matchesResponse.data);
    } catch (error) {
      console.error(
        "Error generating matches:",
        error.message || error.response?.data
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while generating matches.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isUniquePairing = (team1, team2, allTeamPairs) => {
    const team1Key = JSON.stringify(team1.map((player) => player._id).sort());
    const team2Key = JSON.stringify(team2.map((player) => player._id).sort());
    return !allTeamPairs.has(team1Key) && !allTeamPairs.has(team2Key);
  };

  const createTeams = (playerQueue) => {
    if (playerQueue.length < 4) {
      return { team1: [], team2: [] };
    }
    const team1 = playerQueue.splice(0, 2);
    const team2 = playerQueue.splice(0, 2);
    return { team1, team2 };
  };

  const handleWinner = async (
    matchId,
    court,
    selectedBall,
    winningTeam,
    teamPlayers
  ) => {
    if (!winningTeam || !["team1", "team2"].includes(winningTeam)) {
      console.error("Error: Invalid or undefined winning team.");
      return;
    }

    const getEncodedStorageItem = (key) =>
      encodeURIComponent(localStorage.getItem(key));
    const sessionDate = getEncodedStorageItem("Session");
    const localArea = getEncodedStorageItem("LocalArea");

    if (!sessionDate || !localArea) {
      console.error(
        "Error: Session date or local area not found in localStorage."
      );
      return;
    }

    setMatchLoading(true);
    setCourtLoading(true);

    try {
      const courtId = court._id;

      console.log("Match ID:", matchId);
      console.log("Winning Team:", winningTeam);
      console.log("Team Players:", teamPlayers);

      //delete inMatch
      await axios.delete(
        `http://212.85.25.203:3001/users/${user.email}/areas/${localArea}/sessions/${sessionDate}/inMatch/${matchId}`
      );

      //reset court
      await axios.delete(
        `http://212.85.25.203:3001/users/${user.email}/areas/${localArea}/courts/${courtId}/addMatches`
      );

      setCourts((prevCourts) =>
        prevCourts.map((c) =>
          c._id === courtId ? { ...c, addMatches: [] } : c
        )
      );

      const updatePlayerStats = async (players, isWinner) => {
        const standBy = [];

        const promises = players.map(async (playerId) => {
          try {
            standBy.push({
              id: playerId,
              result: isWinner ? "win" : "lose",
            });

            await axios.put(
              `http://212.85.25.203:3001/users/${user.email}/areas/${localArea}/sessions/${sessionDate}/players/${playerId}/updateStats`,
              {
                winIncrement: isWinner ? 1 : 0,
                lossIncrement: isWinner ? 0 : 1,
              }
            );

            await axios.put(
              `http://212.85.25.203:3001/users/${user.email}/areas/${localArea}/sessions/${sessionDate}/players/${playerId}/timeQueue`
            );
          } catch (error) {
            console.error(
              `Error updating stats for player ${playerId}:`,
              error.response?.data || error.message
            );
          }
        });

        await Promise.all(promises);

        const existingData = JSON.parse(localStorage.getItem("standBy")) || [];
        localStorage.setItem(
          "standBy",
          JSON.stringify([...existingData, ...standBy])
        );
      };

      await Promise.all([
        updatePlayerStats(teamPlayers.team1, winningTeam === "team1"),
        updatePlayerStats(teamPlayers.team2, winningTeam === "team2"),
      ]);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
      });

      setMatchLoading(false);
      setCourtLoading(false);

      // Notify success
      Swal.fire({
        html: `
          <div class="swal-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="swal-title">
            <p>${winningTeam === "team1" ? "Team 1" : "Team 2"} Wins</p>
          </div>
        `,
        showConfirmButton: false,
        timer: 2000,
        customClass: {
          popup: "custom-swal-alert",
          htmlContainer: "custom-swal-html-container",
          confirmButton: "custom-swal-confirm-button",
        },
      });

      console.log(
        `Winner: ${
          winningTeam === "team1" ? "Team 1" : "Team 2"
        } stats updated.`
      );
    } catch (error) {
      console.error(
        "Error processing winner update:",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while processing the winner update.",
      });
      setMatchLoading(false);
      setCourtLoading(false);
    }
  };

  /*
selectedPlayers
const appBlueTheme = 'App';
const appBrownTheme = 'brown';

useEffect(()=>{
  setTheme(theme ? appBlueTheme : appBrownTheme);
},[theme]);
*/

  const color = isChecked ? "#00ffffe5" : "#1b1f4b";
  // app

  const [selectedPlayersDel, setSelectedPlayersDel] = useState([]);

  const toggleSelection = (playerId) => {
    setSelectedPlayersDel(
      (prev) =>
        prev.includes(playerId)
          ? prev.filter((id) => id !== playerId) // Deselect
          : [...prev, playerId] // Select
    );
  };
  ///////////////////////////////////////////////
  const handleDeletePlayers = () => {
    if (!Array.isArray(selectedPlayersDel) || selectedPlayersDel.length === 0)
      return;

    Swal.fire({
      title: "Are you sure?",
      text: "This will remove the selected players from the request list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        if (socket && socket.connected) {
          const sessionDate = localStorage.getItem("Session");
          const localArea = localStorage.getItem("LocalArea");

          socket.emit("deletePlayers", {
            userEmail: user.email,
            areaName: localArea,
            sessionDate,
            playerIds: selectedPlayersDel,
          });

          setSelectedPlayersDel([]);

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Selected players have been removed.",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          console.error("❌ Socket is not connected. Cannot delete players.");
          Swal.fire({
            icon: "error",
            title: "Connection Error",
            text: "Socket is not connected. Please try again later.",
          });
        }
      }
    });
  };

  useEffect(() => {
    socket.on("reqToJoinUpdate", ({ playerReqList }) => {
      setReqToJoin(playerReqList);
    });

    return () => {
      socket.off("reqToJoinUpdate");
    };
  }, []);

  ///////////////////////////////////////////////////////
  const toggleSelectAll = () => {
    console.log(selectedPlayersDel);
    if (selectedPlayersDel.length === reqToJoin.length) {
      setSelectedPlayersDel([]);
    } else {
      setSelectedPlayersDel(reqToJoin.map((player) => player._id));
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const currentTime = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
      );
      const formatted = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZone: "Asia/Manila",
      }).format(currentTime);
      setFormattedTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptAllPlayers = async () => {
    if (!selectedPlayersDel.length) return;

    try {
      const sessionDate = localStorage.getItem("Session");
      const localArea = localStorage.getItem("LocalArea");

      const playerReqs = reqToJoin.filter((player) =>
        selectedPlayersDel.includes(player._id)
      );

      const playerRequests = [];
      for (const player of playerReqs) {
        try {
          const playerRequest = await axios.put(
            `http://212.85.25.203:3001/users/${
              user.email
            }/areas/${encodeURIComponent(
              localArea
            )}/sessions/${encodeURIComponent(sessionDate)}/addPlayer`,
            {
              playerId: player._id,
              name: player.name.trim(),
              gender: player.gender,
              level: player.level,
              currentTime: formattedTime,
            }
          );
          playerRequests.push(playerRequest.data);
          setPlayerHistory((prevPRH) => [...prevPRH, playerRequest.data]);
          setPlayers((prevPR) => [...prevPR, playerRequest.data]);
        } catch (error) {
          console.error(`❌ Failed to accept player ${player.name}:`, error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to accept player ${player.name}`,
          });
        }
      }

      if (playerRequests.length) {
        setPlayerHistory((prevHistory) => [...prevHistory, ...playerRequests]);
      }

      socket.emit("deletePlayers", {
        userEmail: user.email,
        areaName: localArea,
        sessionDate,
        playerIds: selectedPlayersDel,
      });

      Swal.fire({
        icon: "success",
        title: "Players Accepted",
        text: "All selected players have been accepted and removed from requests.",
        timer: 2000,
        showConfirmButton: false,
      });

      setSelectedPlayersDel([]);
    } catch (error) {
      console.error("❌ Failed to accept players:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while accepting players.",
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const handleNavigationMobile = (component) => {
    setSelectedComponentMobile(component);
  };

  /*
  const [sessionDetails, setSessionDetails] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        //const textCode = await AsyncStorage.getItem("textCode");
        const textCode = "PXFkhpIx";
        if (!textCode) return;

        const response = await axios.get(
          `https://192.168.100.110:3001/sessions/${textCode}`
        );
        setSessionDetails(response.data);
        console.log("Fetched sessionDetails:", response.data);
      } catch (error) {
        console.error("Error fetching session:", error);
        //setError(error.response?.data?.error || "Failed to fetch session");
      }
    };

    fetchSessionData();
  }, []);
*/

  const sample = async (text) => {
    const sessionDate = localStorage.getItem("Session");
    const localArea = localStorage.getItem("LocalArea");

    if (!sessionDate || !localArea) {
      console.warn("Missing sessionDate or localArea in localStorage");
      return;
    }

    const encodedSessionDate = encodeURIComponent(sessionDate);
    const encodedLocalArea = encodeURIComponent(localArea);

    try {
      const { data: allMatches } = await axios.get(
        `http://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/matches`
      );
      console.log(text, allMatches);
    } catch (e) {
      console.error("Error fetching matches:", e.response?.data || e.message);
    }
  };
  // For Debugging For Debugging For Debugging For Debugging For Debugging For Debugging For Debugging For Debugging For Debugging For Debugging For Debugging For Debugging For Debugging For Debugging

  const fetchArea = async () => {
    try {
      const response = await axios.get(
        `http://212.85.25.203:3001/users/${user.email}/areas`
      );
      setAreas(response.data);
    } catch (error) {
      console.error("Failed to fetch Area at App.js", error);
    }
  };

  const handleBellClick = async () => {
    setIsVisible((prev) => !prev);
  };

  /*
  const areas = await axios.get(
      `http://212.85.25.203:3001/users/${user.email}/areas`
    );
    const areasWithRevenue = areas?.data.map((area) => {
      const totalRevenue = area.sessions.reduce(
        (acc, session) => acc + (session.sessionRevenue || 0),
        0
      );
      return { ...area, totalRevenue };
    });
    fetchArea();
    console.log(areas.data);
    console.log(areasWithRevenue);
    

  console.log("Courts:1", courts);
    console.log("Court loading:2", courtLoading);
    sample("Match: 3");
    const allMatches = matches;
    console.log("Match2:4", allMatches);

    console.log(sessionDetails.players);
    const foundPlayer = sessionDetails.players.filter(
      (player) => player.name === "Jack"
    );

    console.log(foundPlayer);
    */

  return (
    <>
      <div className={`App ${isChecked ? "dark-mode" : "light-mode"}`}>
        {/*
        <ParticlesBackground/>
         */}

        {loading ? (
          <div className="loading-spinner">
            <PacmanLoader
              color={color}
              speedMultiplier={2}
              size={30}
              margin={2}
            />
          </div>
        ) : (
          <div>
            {/*

            <ParticlesBackground/>
            */}

            <>
              {isMobile ? (
                <TopMobile
                  onNavigationMobile={handleNavigationMobile}
                  selectedComponentMobile={selectedComponentMobile}
                  sessionStart={sessionStart}
                  setSessionStart={setSessionStart}
                  setClick={setClick}
                  user={user}
                  logout={logout}
                />
              ) : (
                <div className="top">
                  <TopWeb
                    mode={mode}
                    user={user}
                    selectedArea={selectedArea}
                    setSessions={setSessions}
                    sessions={sessions}
                    sessionStart={sessionStart}
                    setSessionStart={setSessionStart}
                    isChecked={isChecked}
                    handleToggle={handleToggle}
                    logout={logout}
                    textCode={textCode}
                    setTextCode={setTextCode}
                    qrCode={qrCode}
                    setQrCode={setQrCode}
                    selectedComponent={selectedComponent}
                  />
                </div>
              )}
            </>

            {isMobile && (
              <div className="mobile">
                {showCustom && selectedComponent === "allComponent" && (
                  <CustomMatch
                    user={user}
                    players={players}
                    inMatch={inMatch}
                    setInMatch={setInMatch}
                    setMatches={setMatches}
                    setMatchLoading={setMatchLoading}
                    setPlayerLoading={setPlayerLoading}
                    selectedPlayers={selectedPlayers}
                    setSelectedPlayers={setSelectedPlayers}
                    onShowCustom={() => setShowCustom(false)}
                  />
                )}
                {isVisible && (
                  <div className="requestPlayers">
                    <button className="close-btn" onClick={handleBellClick}>
                      ✖
                    </button>
                    <h2>{reqToJoin.length} - Players request to join</h2>

                    {reqToJoin.length > 0 && (
                      <button
                        className="select-all-btn"
                        onClick={toggleSelectAll}
                      >
                        {selectedPlayersDel.length === reqToJoin.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )}

                    <ul>
                      {reqToJoin.map((player) => (
                        <li key={player._id}>
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedPlayersDel.includes(player._id)}
                              onChange={() => toggleSelection(player._id)}
                            />
                            {player.name} ({player.gender}) - Level{" "}
                            {player.level}
                          </label>
                        </li>
                      ))}
                    </ul>
                    {selectedPlayersDel.length > 0 && (
                      <button
                        className="accpt-btn"
                        onClick={() =>
                          handleAcceptAllPlayers(selectedPlayersDel)
                        }
                      >
                        Accept All? ({selectedPlayersDel.length})
                      </button>
                    )}

                    {selectedPlayersDel.length > 0 && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDeletePlayers(selectedPlayersDel)}
                      >
                        🗑 Delete Selected ({selectedPlayersDel.length})
                      </button>
                    )}
                  </div>
                )}
                {selectedComponentMobile === "M&A" && (
                  <ArrowBtn
                    onNavigationMobile={handleNavigationMobile}
                    selectedComponentMobile={selectedComponentMobile}
                  />
                )}

                <div className="midTop">
                  {selectedComponentMobile === "disArea" && (
                    <AddAreaNselectInfo
                      user={user}
                      areas={areas}
                      setAreas={setAreas}
                      selectedArea={selectedArea}
                      setSelectedArea={setSelectedArea}
                      courtFeeTypeDis={courtFeeTypeDis}
                      setCourtFeeTypeDis={setCourtFeeTypeDis}
                      activeComponent={activeComponent}
                      setActiveComponent={setActiveComponent}
                      handleNavigationClick={handleNavigationClick}
                      sessionStart={sessionStart}
                      setSessionStart={setSessionStart}
                      sessions={sessions}
                      setSessions={setSessions}
                      isChecked={isChecked}
                      setIsChecked={setIsChecked}
                      mode={mode}
                    />
                  )}

                  {selectedComponentMobile === "M&A" && (
                    <AddPlayer
                      user={user}
                      areas={areas}
                      isChecked={isChecked}
                      setIsVisible={setIsVisible}
                      reqToJoin={reqToJoin}
                      setReqToJoin={setReqToJoin}
                      players={players}
                      inMatch={inMatch}
                      setPlayers={setPlayers}
                      selectedArea={selectedArea}
                      playerLoading={playerLoading}
                      setPlayerLoading={setPlayerLoading}
                      handleBellClick={handleBellClick}
                    />
                  )}
                  <div className="midTopRight">
                    {selectedComponentMobile === "M&A" && (
                      <Shuffle
                        generateRandomMatch={generateRandomMatch}
                        generateClassicMatch={generateClassicMatch}
                        loading={loading}
                        isChecked={isChecked}
                      />
                    )}
                    {selectedComponentMobile === "M&A" && (
                      <Custom
                        onShowCustom={() => setShowCustom(true)}
                        isChecked={isChecked}
                      />
                    )}
                    {/*rightSide*/}
                  </div>
                  {/*midTop*/}

                  {selectedComponentMobile === "matchNcourt" && (
                    <CourtNmatch
                      user={user}
                      matches={matches}
                      setMatches={setMatches}
                      inMatch={inMatch}
                      setInMatch={setInMatch}
                      setPlayers={setPlayers}
                      isChecked={isChecked}
                      players={players}
                      courts={courts}
                      setCourts={setCourts}
                      handleAddMatch={handleAddMatch}
                      availableBalls={availableBalls}
                      selectedCourt={selectedCourt}
                      setSelectedCourt={setSelectedCourt}
                      selectedBall={selectedBall}
                      setSelectedBall={setSelectedBall}
                      matchLoading={matchLoading}
                      setMatchLoading={setMatchLoading}
                      handleWinner={handleWinner}
                      courtLoading={courtLoading}
                      setCourtLoading={setCourtLoading}
                      onNavigationMobile={handleNavigationMobile}
                    />
                  )}

                  {selectedComponentMobile === "dashboardMobile" && (
                    <DashNsched
                      user={user}
                      areas={areas}
                      setAreas={setAreas}
                      isChecked={isChecked}
                      setIsChecked={setIsChecked}
                      schedules={schedules}
                      setSchedules={setSchedules}
                      newSchedule={newSchedule}
                      setNewSchedule={setNewSchedule}
                      historyArea={historyArea}
                      setHistoryArea={setHistoryArea}
                    />
                  )}
                  {selectedComponentMobile === "paymentMobile" && (
                    <PaymentNqueue
                      players={players}
                      forDisplay={forDisplay}
                      setForDisplay={setForDisplay}
                      setPlayers={setPlayers}
                      playerHistory={playerHistory}
                      setPlayerHistory={setPlayerHistory}
                      inMatch={inMatch}
                      totalRev={totalRev}
                      setTotalRev={setTotalRev}
                      user={user}
                      courtFeeTypeDis={courtFeeTypeDis}
                      setCourtFeeTypeDis={setCourtFeeTypeDis}
                      areas={areas}
                      setAreas={setAreas}
                      isChecked={isChecked}
                      playerLoading={playerLoading}
                      setPlayerLoading={setPlayerLoading}
                      handleWinner={handleWinner}
                      courts={courts}
                      matches={matches}
                    />
                  )}

                  {selectedComponentMobile === "historyMobile" && (
                    <HistoryNplayerHis
                      user={user}
                      areas={areas}
                      click={click}
                      totalRev={totalRev}
                      setPlayers={setPlayers}
                      players={players}
                      playerHistory={playerHistory}
                      setPlayerHistory={setPlayerHistory}
                      setClick={setClick}
                      isChecked={isChecked}
                      setDisplayPlayers={setDisplayPlayers}
                      displayPlayers={displayPlayers}
                      historyArea={historyArea}
                      setHistoryArea={setHistoryArea}
                      selectedAreaHistory={selectedAreaHistory}
                      setSelectedAreaHistory={setSelectedAreaHistory}
                    />
                  )}

                  {selectedComponentMobile === "settingsMobile" && <Settings />}
                </div>
              </div>
            )}
            {/********************************************************************************************************/}
            <div className="btm">
              {/*<Login/>*/}

              {isVisible && (
                <div className="requestPlayers">
                  <button className="close-btn" onClick={handleBellClick}>
                    ✖
                  </button>
                  <h2>{reqToJoin.length} - Players request to join</h2>

                  {reqToJoin.length > 0 && (
                    <button
                      className="select-all-btn"
                      onClick={toggleSelectAll}
                    >
                      {selectedPlayersDel.length === reqToJoin.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}

                  <ul>
                    {reqToJoin?.map((player) => (
                      <li key={player._id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedPlayersDel.includes(player._id)}
                            onChange={() => toggleSelection(player._id)}
                          />
                          {player.name} ({player.gender}) - Level {player.level}
                        </label>
                      </li>
                    ))}
                  </ul>
                  {selectedPlayersDel.length > 0 && (
                    <button
                      className="accpt-btn"
                      onClick={() => handleAcceptAllPlayers(selectedPlayersDel)}
                    >
                      Accept All? ({selectedPlayersDel.length})
                    </button>
                  )}

                  {selectedPlayersDel.length > 0 && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeletePlayers(selectedPlayersDel)}
                    >
                      🗑 Delete Selected ({selectedPlayersDel.length})
                    </button>
                  )}
                </div>
              )}
              {showCustom && selectedComponent === "allComponent" && (
                <CustomMatch
                  user={user}
                  players={players}
                  inMatch={inMatch}
                  setInMatch={setInMatch}
                  setMatches={setMatches}
                  setMatchLoading={setMatchLoading}
                  setPlayerLoading={setPlayerLoading}
                  selectedPlayers={selectedPlayers}
                  setSelectedPlayers={setSelectedPlayers}
                  onShowCustom={() => setShowCustom(false)}
                />
              )}

              {selectedComponent === "liveView" ? (
                <Live
                  user={user}
                  isChecked={isChecked}
                  courts={courts}
                  setCourts={setCourts}
                  inMatch={inMatch}
                  setInMatch={setInMatch}
                  players={players}
                  setPlayers={setPlayers}
                  playerHistory={playerHistory}
                  setPlayerHistory={setPlayerHistory}
                  setMatches={setMatches}
                  matches={matches}
                  selectedComponent={selectedComponent}
                  setSelectedComponent={setSelectedComponent}
                />
              ) : (
                !isMobile && (
                  <div className="leftSide">
                    <Nav
                      onNavigationClick={handleNavigationClick}
                      selectedComponent={selectedComponent}
                      sessionStart={sessionStart}
                      isChecked={isChecked}
                      setClick={setClick}
                    />
                  </div>
                )
              )}
              <div className="midRightWrap">
                <div className="mid">
                  {selectedComponent === "selectSettings" && <Settings />}
                  {(!sessionStart && selectedComponent === "selectArea" && (
                    <AddArea
                      user={user}
                      areas={areas}
                      setAreas={setAreas}
                      selectedArea={selectedArea}
                      setSelectedArea={setSelectedArea}
                      setCourtFeeTypeDis={setCourtFeeTypeDis}
                      courtFeeTypeDis={courtFeeTypeDis}
                      activeComponent={activeComponent}
                      setActiveComponent={setActiveComponent}
                      onNavigationClick={handleNavigationClick}
                    />
                  )) ||
                    selectedComponent === "allComponent"}

                  {(!sessionStart &&
                    selectedComponent === "displayGameMode" && (
                      <GameMode
                        onNavigationClick={handleNavigationClick}
                        isChecked={isChecked}
                        setMode={setMode}
                        mode={mode}
                      />
                    )) ||
                    selectedComponent === "allComponent"}
                  {selectedComponent === "displayDashboard" && (
                    <Dashboard
                      user={user}
                      areas={areas}
                      setAreas={setAreas}
                      isChecked={isChecked}
                      setIsChecked={setIsChecked}
                      schedules={schedules}
                      setSchedules={setSchedules}
                      newSchedule={newSchedule}
                      setNewSchedule={setNewSchedule}
                      historyArea={historyArea}
                      setHistoryArea={setHistoryArea}
                    />
                  )}
                  {selectedComponent === "displayPayment" && (
                    <Payment
                      players={players}
                      forDisplay={forDisplay}
                      setForDisplay={setForDisplay}
                      setPlayers={setPlayers}
                      playerHistory={playerHistory}
                      setPlayerHistory={setPlayerHistory}
                      inMatch={inMatch}
                      totalRev={totalRev}
                      setTotalRev={setTotalRev}
                      user={user}
                      courtFeeTypeDis={courtFeeTypeDis}
                      setCourtFeeTypeDis={setCourtFeeTypeDis}
                      areas={areas}
                      setAreas={setAreas}
                      isChecked={isChecked}
                      playerLoading={playerLoading}
                      setPlayerLoading={setPlayerLoading}
                    />
                  )}

                  {selectedComponent === "displayHistory" && (
                    <History
                      user={user}
                      areas={areas}
                      click={click}
                      totalRev={totalRev}
                      setPlayers={setPlayers}
                      players={players}
                      playerHistory={playerHistory}
                      setPlayerHistory={setPlayerHistory}
                      setClick={setClick}
                      isChecked={isChecked}
                      setDisplayPlayers={setDisplayPlayers}
                      displayPlayers={displayPlayers}
                      historyArea={historyArea}
                      setHistoryArea={setHistoryArea}
                      selectedAreaHistory={selectedAreaHistory}
                      setSelectedAreaHistory={setSelectedAreaHistory}
                    />
                  )}

                  <div className="midTop">
                    {selectedComponent === "allComponent" && (
                      <AddPlayer
                        user={user}
                        areas={areas}
                        isChecked={isChecked}
                        setIsVisible={setIsVisible}
                        reqToJoin={reqToJoin}
                        setReqToJoin={setReqToJoin}
                        players={players}
                        inMatch={inMatch}
                        setPlayers={setPlayers}
                        selectedArea={selectedArea}
                        playerLoading={playerLoading}
                        setPlayerLoading={setPlayerLoading}
                        handleBellClick={handleBellClick}
                      />
                    )}
                    <div className="midTopRight">
                      {selectedComponent === "allComponent" && (
                        <Shuffle
                          generateRandomMatch={generateRandomMatch}
                          generateClassicMatch={generateClassicMatch}
                          loading={loading}
                          isChecked={isChecked}
                        />
                      )}
                      {selectedComponent === "allComponent" && (
                        <Custom
                          onShowCustom={() => setShowCustom(true)}
                          isChecked={isChecked}
                        />
                      )}
                      {/*rightSide*/}
                    </div>
                    {/*midTop*/}
                  </div>
                  <div className="midBot">
                    {selectedComponent === "allComponent" && (
                      <CourtCon
                        user={user}
                        isChecked={isChecked}
                        selectedCourt={selectedCourt}
                        inMatch={inMatch}
                        setInMatch={setInMatch}
                        courts={courts}
                        setCourts={setCourts}
                        setSelectedCourt={setSelectedCourt}
                        selectedBall={selectedBall}
                        setSelectedBall={setSelectedBall}
                        handleWinner={handleWinner}
                        courtLoading={courtLoading}
                        setCourtLoading={setCourtLoading}
                      />
                    )}
                  </div>

                  {/*Mid*/}
                </div>

                <div className="rightSide">
                  {selectedComponent === "displayDashboard" && (
                    <Schedule
                      user={user}
                      areas={areas}
                      setAreas={setAreas}
                      isChecked={isChecked}
                      setIsChecked={setIsChecked}
                      schedules={schedules}
                      setSchedules={setSchedules}
                      newSchedule={newSchedule}
                      setNewSchedule={setNewSchedule}
                    />
                  )}

                  {(!sessionStart &&
                    ["selectArea", "displayGameMode"].includes(
                      selectedComponent
                    ) && (
                      <SelectInfo
                        onNavigationClick={handleNavigationClick}
                        sessionStart={sessionStart}
                        setSessionStart={setSessionStart}
                        sessions={sessions}
                        setSessions={setSessions}
                        selectedArea={selectedArea}
                        courtFeeTypeDis={courtFeeTypeDis}
                        setActiveComponent={setActiveComponent}
                        activeComponent={activeComponent}
                        isChecked={isChecked}
                        setIsChecked={setIsChecked}
                        areas={areas}
                        mode={mode}
                        user={user}
                      />
                    )) ||
                    selectedComponent === "allComponent"}
                  {selectedComponent === "displayHistory" &&
                    click === "session" && (
                      <PlayerHistory
                        selectedAreaHistory={selectedAreaHistory}
                        setSelectedAreaHistory={setSelectedAreaHistory}
                        displayPlayers={displayPlayers}
                        setDisplayPlayers={setDisplayPlayers}
                        playerHistory={playerHistory}
                        setPlayerHistory={setPlayerHistory}
                        isChecked={isChecked}
                      />
                    )}
                  {selectedComponent === "allComponent" && (
                    <MatchMaking
                      user={user}
                      matches={matches}
                      setMatches={setMatches}
                      inMatch={inMatch}
                      setInMatch={setInMatch}
                      setPlayers={setPlayers}
                      isChecked={isChecked}
                      players={players}
                      courts={courts}
                      setCourts={setCourts}
                      handleAddMatch={handleAddMatch}
                      availableBalls={availableBalls}
                      selectedCourt={selectedCourt}
                      setSelectedCourt={setSelectedCourt}
                      selectedBall={selectedBall}
                      setSelectedBall={setSelectedBall}
                      matchLoading={matchLoading}
                      setMatchLoading={setMatchLoading}
                      setPlayerLoading={setPlayerLoading}
                    />
                  )}
                  {selectedComponent === "displayPayment" && (
                    <Queue
                      user={user}
                      isChecked={isChecked}
                      handleWinner={handleWinner}
                      forDisplay={forDisplay}
                      setForDisplay={setForDisplay}
                      courts={courts}
                      players={players}
                      inMatch={inMatch}
                      matches={matches}
                    />
                  )}
                  {/*rightSide*/}
                </div>
              </div>
              {/*btm*/}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
export default App;
