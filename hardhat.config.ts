import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    calibration: {
      url: "https://api.calibration.node.glif.io/rpc/v1",
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 314159,
    },

  },
};

export default config;
