import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { Logo } from "../img/Appraisr";
import {
  ConnectButton,
  Icon,
  TabList,
  Tab,
  Button,
  Modal,
  useNotification,
} from "web3uikit";
import { movies } from "../helpers/library";
import { orgs } from "../helpers/libraryOrgs";
import { useState } from "react";
import { useMoralis } from "react-moralis";

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState();
  const { isAuthenticated, Moralis, account } = useMoralis();
  const [myMovies, setMyMovies] = useState();
  const [myReviews, setMyReviews] = useState();
  const [selectedOrg, setSelectedOrg] = useState();

  useEffect(() => {
    async function fetchReviews() {
      // await Moralis.start({
      //   serverUrl: "https://k9yyldx5xvzu.usemoralis.com:2053/server",
      //   appId: "oMKicmpBkHvbWnIGOzzqfHH8Rci6qRu7QXMRNF0f",
      // }); //if getting errors add this

      try {
        //   const theList = await Moralis.Cloud.run("getMyList", {
        //     addrs: account,
        //   });

        // const filterdA = movies.filter(function (e) {
        //   return theList.indexOf(e.Name) > -1;
        // });

        setMyReviews(orgs);
      } catch (error) {
        console.error(error);
      }
    }

    fetchReviews();
  }, [account]);

  const dispatch = useNotification();

  const handleNewNotification = () => {
    dispatch({
      type: "error",
      message: "Pleaser Connect Your Crypto Wallet",
      title: "Not Authenticated",
      position: "topL",
    });
  };

  const handleAddNotification = () => {
    dispatch({
      type: "success",
      message: "Movie Added to List",
      title: "Success",
      position: "topL",
    });
  };

  return (
    <>
      <div className="logo">
        <Logo />
      </div>
      <div className="connect">
        <Icon fill="#ffffff" size={24} svg="bell" />
        <ConnectButton />
      </div>
      <div className="topBanner">
        <TabList defaultActiveKey={1} tabStyle="bar">
          <Tab tabKey={1} tabName={"Organizations"}>
            <div className="scene">
              <img src={orgs[0].BgImg} className="sceneImg" alt=""></img>
              <img className="sceneLogo" src={orgs[0].Logo} alt=""></img>
              <p className="sceneDesc">{orgs[0].Description}</p>
              <h2 className="rating">Avg Rating: {orgs[0].AvgRating}</h2>
              <div className="playButton">
                <Button
                  icon="chevronRightX2"
                  text="See Reviews"
                  theme="secondary"
                  type="button"
                  onClick={handleNewNotification}
                />
              </div>
            </div>

            <div className="title">Organizations</div>
            <div className="thumbs">
              {orgs &&
                orgs.map((e, index) => {
                  return (
                    <img
                      src={e.Img}
                      className="thumbnail"
                      onClick={() => {
                        setSelectedOrg(e);
                        setVisible(true);
                      }}
                      key={index}
                      alt=""
                    ></img>
                  );
                })}
            </div>
          </Tab>

          <Tab tabKey={2} tabName={"MyReviews"}>
            <div className="ownListContent">
              <div className="title">Your Library</div>
              {myMovies && isAuthenticated ? (
                <>
                  <div className="ownThumbs">
                    {myMovies.map((e) => {
                      return (
                        <img
                          src={e.Thumnbnail}
                          className="thumbnail"
                          onClick={() => {
                            setSelectedFilm(e);
                            setVisible(true);
                          }}
                          alt=""
                        ></img>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="ownThumbs">
                  You need to Authenicate TO View Your Own list
                </div>
              )}
            </div>
          </Tab>
        </TabList>
        {selectedOrg && (
          <div className="modal">
            <Modal
              onCloseButtonPressed={() => setVisible(false)}
              isVisible={visible}
              hasFooter={false}
              width="1000px"
            >
              <div className="modalContent">
                <img src={selectedOrg.Img} className="modalImg" alt=""></img>
                <div className="modalPlayButton">
                  {isAuthenticated ? (
                    <>
                      <Link to="/player" state={selectedOrg.Movie}>
                        <Button
                          icon="chevronRightX2"
                          text="Play"
                          theme="secondary"
                          type="button"
                        />
                      </Link>
                      <Button
                        icon="plus"
                        text="Add to My List"
                        theme="translucent"
                        type="button"
                        onClick={async () => {
                          // await Moralis.Cloud.run("updateMyList", {
                          //   addrs: account,
                          //   newFav: selectedFilm.Name,
                          // });
                          handleAddNotification();
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        icon="chevronRightX2"
                        text="Play"
                        theme="secondary"
                        type="button"
                        onClick={handleNewNotification}
                      />
                      <Button
                        icon="plus"
                        text="Add to My List"
                        theme="translucent"
                        type="button"
                        onClick={handleNewNotification}
                      />
                    </>
                  )}
                </div>
                <div className="movieInfo">
                  <div className="description">{selectedOrg.Description}</div>
                  <div className="detailedInfo">
                    Category:
                    <span className="deets">{selectedOrg.Category}</span>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
