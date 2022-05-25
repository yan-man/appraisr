import wacarnolds from "../img/wacarnolds.webp";
import wacarnoldsLogo from "../img/wacarnoldsLogo.png";
import wacarnoldsBG from "../img/wacarnoldsBG.png";

import studio54 from "../img/studio54.png";
import studio54BG from "../img/studio54BG.png";

export const orgs = [
  {
    Img: wacarnolds,
    Logo: wacarnoldsLogo,
    BgImg: wacarnoldsBG,
    URI: "wacURI",
    Name: "WacArnold's",
    Description: "Big Wacs since 2003. 69,420 sold daily.",
    Category: "Restaurant",
    AvgRating: "9.0",
    Admin: "",
    Reviews: [
      {
        Author: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        Rating: "8.6",
        Review: "It's the best restaurant ever",
        Upvotes: 120,
        Downvotes: 23,
      },
      {
        Author: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        Rating: "7.9",
        Review: "WacArnolds ruined my life!",
        Upvotes: 66,
        Downvotes: 45,
      },
    ],
  },
  {
    Img: studio54,
    Logo: studio54,
    BgImg: studio54BG,
    URI: "",
    Name: "studio54",
    Description: "I'm Rick James.",
    Category: "Nightclub",
    AvgRating: "8.0",
    Admin: "",
    Reviews: [
      {
        Author: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        Rating: "8.2",
        Review: "I was there with Prince",
        Upvotes: 101,
        Downvotes: 35,
      },
      {
        Author: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        Rating: "4.5",
        Review: "I got kicked in the chest",
        Upvotes: 44,
        Downvotes: 87,
      },
    ],
  },
];

export const reviews = [
  {
    Author: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    Rating: "8.6",
    Review: "It's the best restaurant ever",
    Upvotes: 120,
    Downvotes: 23,
  },
  {
    Author: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    Rating: "7.9",
    Review: "WacArnolds ruined my life!",
    Upvotes: 66,
    Downvotes: 45,
  },
];
