import logUpdate from "log-update";
import chalk from 'chalk';

const barFrames = ["⣹⣿⣿⣿⣏⣉⣉", "⣉⣿⣿⣿⣿⣉⣉", "⣉⣹⣿⣿⣿⣏⣉", "⣉⣉⣿⣿⣿⣿⣉", "⣉⣉⣹⣿⣿⣿⣏", "⣉⣉⣉⣿⣿⣿⣿", "⣏⣉⣉⣹⣿⣿⣿", "⣿⣉⣉⣉⣿⣿⣿", "⣿⣏⣉⣉⣹⣿⣿", "⣿⣿⣉⣉⣉⣿⣿", "⣿⣿⣏⣉⣉⣹⣿", "⣿⣿⣿⣉⣉⣉⣿", "⣿⣿⣿⣏⣉⣉⣹", "⣿⣿⣿⣿⣉⣉⣉"]
const spinnerFrames = ["⠁", "⠂", "⠄", "⡀", "⡈", "⡐", "⡠", "⣀", "⣁", "⣂", "⣄", "⣌", "⣔", "⣤", "⣥", "⣦", "⣮", "⣶", "⣷", "⣿", "⡿", "⠿", "⢟", "⠟", "⡛", "⠛", "⠫", "⢋", "⠋", "⠍", "⡉", "⠉", "⠑", "⠡", "⢁"]

export default class LogHelper {
    constructor() {
        this.totalSteps = 0;
        this.currentStep = 0;
        this.currentProcess = "";
        this.progress = 0; // 0 - 100

        this.spinnerInterval = null;
        this.spinnerFrameIndex = 0;
        this.barFrameIndex = 0;
    }

    start() {
        this.spinnerInterval = setInterval(() => {
            logUpdate(`[${chalk.greenBright(
                barFrames[this.barFrameIndex = ++this.barFrameIndex % barFrames.length].repeat(Math.ceil((this.progress * 0.4) / 7)).slice(0, Math.ceil(this.progress * 0.4))
            )}${chalk.gray("⣉".repeat(40 - Math.ceil(this.progress * 0.4)))}] ${this.progress}%
${spinnerFrames[this.spinnerFrameIndex = ++this.spinnerFrameIndex % spinnerFrames.length]} ${chalk.gray(this.currentProcess)}`);
        }, 80);
    }

    stop() {
        clearInterval(this.spinnerInterval);
        this.spinnerInterval = null;
        logUpdate.clear();
    }

    reset() {
        this.progress = 0;
        this.spinnerFrameIndex = 0;
        this.barFrameIndex = 0;
        this.currentProcess = "";
    }

    setTotalSteps(totalSteps) {
        this.totalSteps = totalSteps;
    }

    nextProcess(process) {
        this.currentStep++;
        this.currentProcess = process;
        this.progress = Math.min(100, Math.round((this.currentStep / this.totalSteps) * 100)); // prevent progress from going over 100
    }
}