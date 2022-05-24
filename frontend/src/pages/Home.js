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
import { orgs, reviews } from "../helpers/libraryOrgs";
import { useState } from "react";
import { useMoralis } from "react-moralis";

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState();
  const { isAuthenticated, Moralis, account } = useMoralis();
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

  const voteOnReview = (isUpvote) => {
    if (!isAuthenticated) {
      handleNewNotification();
    } else {
      if (isUpvote) {
        console.log("upvote");
      } else {
        console.log("downvote");
      }
    }
  };

  return (
    <>
      <div className="logo">
        <Logo />
      </div>

      <div className="connect">
        <Button
          color="#6795b1"
          icon="plus"
          iconLayout="icon-only"
          id="test-button-primary-icon-only"
          onClick={function noRefCheck() {}}
          radius={20}
          theme="colored"
          type="button"
        />
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
                  onClick={() => {
                    setSelectedOrg(orgs[0]);
                    setVisible(true);
                  }}
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

          <Tab tabKey={2} tabName={"Reviews"}>
            <div className="ownListContent">
              <div className="title">
                Reviews
                <Icon
                  className="backButton"
                  fill="rgba(255,255,255,0.25)"
                  size={60}
                  svg="arrowCircleLeft"
                  style={{ left: 0 }}
                />
              </div>
              <>
                <div className="ownThumbs">
                  {selectedOrg && selectedOrg.Reviews ? (
                    selectedOrg.Reviews.map((r, index) => {
                      return (
                        <div className="review-card">
                          <div className="review" style={{ margin: "0px" }}>
                            <p>Author: {r.Author}</p>
                            <p>Rating: {r.Rating}</p>
                            <p>Review: {r.Review}</p>
                          </div>

                          <div className="votes" style={{ display: "flex" }}>
                            <div>
                              <Icon fill="#ffffff" size={24} svg="triangleUp" />
                              <p
                                onClick={() => {
                                  voteOnReview(true);
                                }}
                              >
                                {r.Upvotes}
                              </p>
                            </div>

                            <div>
                              <Icon
                                fill="#ffffff"
                                size={24}
                                svg="triangleDown"
                              />
                              <p
                                onClick={() => {
                                  voteOnReview(false);
                                }}
                              >
                                {r.Downvotes}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="">
                      You need to select a movie to view reviews
                    </div>
                  )}
                </div>
              </>
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
                  {reviews &&
                    reviews.map((r, index) => {
                      return (
                        <div className="review-card">
                          <div className="review" style={{ margin: "0px" }}>
                            <p>Author: {r.Author}</p>
                            <p>Rating: {r.Rating}</p>
                            <p>Review: {r.Review}</p>
                          </div>

                          <div className="votes" style={{ display: "flex" }}>
                            <div>
                              <Icon fill="#ffffff" size={24} svg="triangleUp" />
                              <p
                                onClick={() => {
                                  voteOnReview(true);
                                }}
                              >
                                {r.Upvotes}
                              </p>
                            </div>

                            <div>
                              <Icon
                                fill="#ffffff"
                                size={24}
                                svg="triangleDown"
                              />
                              <p
                                onClick={() => {
                                  voteOnReview(false);
                                }}
                              >
                                {r.Downvotes}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="movieInfo">
                  <div className="description">{selectedOrg.Description}</div>
                  <div className="description">
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
