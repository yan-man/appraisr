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
import { savedOrgs } from "../helpers/library";
import { useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { divide } from "mathjs";
import contractAddress from "../contracts/contract-address.json";
// import appraiser_abi from "../contracts/Appraiser.json";
import reviewer_abi from "../contracts/Reviewer.json";
import appraiserOrganization_abi from "../contracts/AppraiserOrganization.json";

const Home = () => {
  const [visible, setVisible] = useState(false);
  const { isAuthenticated, Moralis, account, user } = useMoralis();
  const [selectedOrg, setSelectedOrg] = useState();
  const [selectedTab, setSelectedTab] = useState(1);
  const [orgs, setOrgs] = useState(savedOrgs);
  const contractProcessor = useWeb3ExecuteFunction();

  useEffect(() => {
    async function updateReviewDetails() {
      await Promise.all(
        orgs.map(async (org) => {
          org.NumRatings = org.Reviews.length;
        })
      );
      setOrgs(orgs);
    }
    updateReviewDetails();
  }, [orgs]);
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

  const voteOnReview = async (reviewId, isUpvote) => {
    if (!isAuthenticated) {
      handleNewNotification();
    } else {
      console.log(account);

      // let options = {
      //   contractAddress: contractAddress.Reviewer,
      //   functionName: "voteOnReview",
      //   abi: reviewer_abi.abi,
      //   params: {
      //     orgId_: selectedOrg.orgId,
      //     reviewId_: reviewId,
      //     isUpvote_: isUpvote,
      //   },
      //   msgValue: Moralis.Units.ETH(0),
      // };

      // await contractProcessor.fetch({
      //   params: options,
      //   onSuccess: () => {
      //     console.log("success");
      //   },
      // });

      const web3Provider = await Moralis.enableWeb3();
      const ethers = Moralis.web3Library;

      const appraiserOrganization = new ethers.Contract(
        selectedOrg.AppraiserOrganization,
        appraiserOrganization_abi.abi,
        web3Provider
      );

      const review = await appraiserOrganization.s_reviews(reviewId);

      const uv = await appraiserOrganization.s_upvoteCount(reviewId);
      const dv = await appraiserOrganization.s_downvoteCount(reviewId);
      console.log(uv.toString(), dv.toString());

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
        <ConnectButton />
      </div>
      <div className="topBanner">
        <TabList
          defaultActiveKey={selectedTab}
          tabStyle="bar"
          onChange={(selectedKey) => {
            if (selectedKey === 2) {
              setSelectedTab(2);
            }
          }}
        >
          <Tab tabKey={1} tabName={"Organizations"}>
            <div className="scene">
              {orgs && (
                <>
                  <img src={orgs[0].BgImg} className="sceneImg" alt=""></img>
                  <img className="sceneLogo" src={orgs[0].Logo} alt=""></img>
                  <p className="sceneDesc">{orgs[0].Description}</p>
                  <h2 className="rating">Avg Rating: {orgs[0].AvgRating}</h2>
                  <p className="sceneDesc">
                    Total Reviews: {orgs[0].NumRatings}
                  </p>
                  <div className="playButton">
                    <Button
                      icon="chevronRightX2"
                      text="See Reviews"
                      theme="secondary"
                      type="button"
                      onClick={() => {
                        setSelectedOrg(orgs[0]);
                        setSelectedTab(2);
                        setVisible(false);
                      }}
                    />
                  </div>
                </>
              )}
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
                <Button
                  icon="arrowCircleLeft"
                  iconLayout="icon-only"
                  className="backButton"
                  size={60}
                  onClick={() => {
                    setSelectedTab(1);
                    setSelectedOrg(orgs[0]);
                    setVisible(false);
                  }}
                />
                <h1 style={{ color: "#6795b1" }}>
                  {selectedOrg && selectedOrg.Name}
                </h1>
                <h2 style={{ color: "#6795b1" }}>
                  <em>{selectedOrg && selectedOrg.Description}</em>
                </h2>
                <p style={{ color: "white" }}>Reviews</p>
              </div>
              <>
                <div className="ownThumbs">
                  {selectedOrg && selectedOrg.Reviews ? (
                    selectedOrg.Reviews.map((r, index) => {
                      return (
                        <div className="review-card" key={index}>
                          <div className="review" style={{ margin: "0px" }}>
                            <p>Author: {r.Author}</p>
                            <p>Rating: {divide(r.Rating, 10)}</p>
                            <p>Review: {r.Review}</p>
                          </div>

                          <div className="votes" style={{ display: "flex" }}>
                            <div
                              onClick={async () => {
                                await voteOnReview(r.reviewId, true);
                              }}
                            >
                              <Icon fill="#ffffff" size={24} svg="triangleUp" />
                              <p>{r.Upvotes}</p>
                            </div>

                            <div
                              onClick={async () => {
                                await voteOnReview(r.reviewId, false);
                              }}
                            >
                              <Icon
                                fill="#ffffff"
                                size={24}
                                svg="triangleDown"
                              />
                              <p>{r.Downvotes}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="">
                      You need to select an organization to see reviews
                    </div>
                  )}
                </div>
              </>
            </div>
          </Tab>

          <Tab tabKey={3} tabName={"MyReviews"}>
            <div className="ownListContent">
              <div className="title">
                <Button
                  icon="arrowCircleLeft"
                  iconLayout="icon-only"
                  className="backButton"
                  size={60}
                  onClick={() => {
                    setSelectedTab(1);
                    setSelectedOrg(orgs[0]);
                    setVisible(false);
                  }}
                />
                <h1 style={{ color: "#6795b1" }}>
                  {selectedOrg && selectedOrg.Name}
                </h1>
                <h2 style={{ color: "#6795b1" }}>
                  <em>{selectedOrg && selectedOrg.Description}</em>
                </h2>
                <p style={{ color: "white" }}>Reviews</p>
              </div>
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

                <div className="movieInfo">
                  <div className="description">
                    <div className="modalPlayButton">
                      <Button
                        icon="chevronRightX2"
                        text="See Reviews"
                        theme="secondary"
                        type="button"
                        onClick={() => {
                          setSelectedTab(2);
                          setVisible(false);
                        }}
                      />
                    </div>
                  </div>
                  <div className="description">
                    <Button
                      color="#6795b1"
                      icon="plus"
                      iconLayout="icon-only"
                      id="add-review"
                      onClick={function noRefCheck() {}}
                      radius={20}
                      theme="colored"
                      type="button"
                    />
                  </div>
                  <div className="description" style={{ textAlign: "center" }}>
                    {selectedOrg.Description}
                  </div>
                  <div className="description">
                    Category:
                    <span className="deets">{selectedOrg.Category}</span>
                  </div>
                  <div
                    className="description"
                    style={{ fontSize: "150%", color: "#6795b1" }}
                  >
                    Avg Rating: {selectedOrg.AvgRating}
                  </div>
                  <div className="description">
                    Total Reviews: {selectedOrg.NumRatings}
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
