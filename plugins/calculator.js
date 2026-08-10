module.exports = {

    name: "calc",

    description: "Simple calculator",

    async execute(args) {

        if (args.length < 3) {
            return `
🧮 Calculator

Usage:
calc 10 + 20
calc 50 * 3
`;
        }

        const expression = args.join(" ");

        try {

            const result = Function(
                `"use strict"; return (${expression})`
            )();

            return `
🧮 ISAAC AI CALCULATOR

Expression:
${expression}

Result:
${result}
`;

        } catch {

            return "❌ Invalid calculation.";

        }

    }

};
