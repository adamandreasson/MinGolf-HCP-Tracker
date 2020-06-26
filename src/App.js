import React, { useState } from "react";
import "./App.css";
import { Line } from "react-chartjs-2";

const App = () => {
	const [input, setInput] = useState("");
	const [showSeries, setSeries] = useState(false);

	const getGraph = () => {
		const lines = input.split("\n");
		let games = [];
		let isParsingGame = false;
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!isParsingGame) {
				if (
					/^\+?\d+$/.test(line) &&
					/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(lines[i + 1])
				) {
					isParsingGame = true;
					games.push({ number: line, startLine: i, hcp: null });
				}
				continue;
			}

			const game = games[games.length - 1];
			const gameLine = i - game.startLine;
			if (gameLine === 1 && /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(line)) {
				game.date = line;
				game.unix = Date.parse(line + " 05:00:00");
			}

			const nextLine = lines.length > i + 1 ? lines[i + 1].trim() : null;
			if (
				nextLine === null ||
				nextLine.length === 0 ||
				nextLine === "Rond" ||
				nextLine === "Vilka ronder visas?"
			) {
				let num = parseFloat(line.replace(",", "."));
				if (num) {
					game.hcp = num;
				}
			}

			if (line.trim().length === 0) {
				isParsingGame = false;
			}
		}
		console.log(games);

		games.sort((a, b) => (a.unixtime < b.unixtime ? 1 : -1));

		for (let i = 0; i < games.length; i++) {
			const game = games[i];
			const gamesSet = games.slice(i < 20 ? 0 : i - 20, i);
			gamesSet.sort((a, b) => (a.hcp < b.hcp ? -1 : 1));
			const topGames = gamesSet.slice(
				0,
				gamesSet.length < 8 ? gamesSet.length : 8
			);
			if (topGames.length < 1) {
				continue;
			}
			const hcp =
				topGames.reduce((sum, x) => sum + x.hcp, 0) /
				topGames.filter((g) => g.hcp > 0).length;
			game.currentHcp = Math.floor(hcp * 10) / 10;
		}

		const graph = {
			datasets: [
				{
					label: "Hcp resultat i rond",
					type: "scatter",
					borderColor: "#D53F8C",
					backgroundColor: "#D53F8C",
					pointBackgroundColor: "#D53F8C",
					pointBorderColor: "#D53F8C",

					data: games.slice(1, games.length).map((game) => game.hcp),
				},
				{
					label: "Ditt HCP",
					type: "line",
					borderColor: "#2F855A",
					backgroundColor: "#48BB78",
					data: games.slice(1, games.length).map((game) => game.currentHcp),
				},
			],
			labels: games.slice(1, games.length).map((game) => game.unix),
		};

		return graph;
	};

	const graphOptions = {
		scales: {
			xAxes: [
				{
					type: "time",
					distribution: showSeries ? "series" : "linear",
					time: {},
				},
			],
		},
	};

	return (
		<div className="App">
			<header className="App-header">
				<p>Klistra in tabell från mingolf (Expandera hcp-historik, ctrl+A)</p>
				<textarea
					onChange={(e) => setInput(e.target.value)}
					rows="10"
				></textarea>
				<div>
					<button onClick={() => setSeries(!showSeries)}>
						Visa tidsskala / jämna steg
					</button>
				</div>
			</header>
			<Line data={getGraph()} options={graphOptions} />
		</div>
	);
};

export default App;
