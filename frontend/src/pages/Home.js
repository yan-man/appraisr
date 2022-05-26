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
  Form,
} from "web3uikit";
import { savedOrgs } from "../helpers/library";
import { useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { divide } from "mathjs";
import contractAddress from "../contracts/contract-address.json";
// import appraiser_abi from "../contracts/Appraiser.json";
import reviewer_abi from "../contracts/Reviewer.json";
import appraiserOrganization_abi from "../contracts/AppraiserOrganization.json";
import { useInterval } from "../helpers/utils";

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const { isAuthenticated, Moralis, isWeb3Enabled, account, user } =
    useMoralis();
  const [selectedOrg, setSelectedOrg] = useState();
  const [selectedTab, setSelectedTab] = useState(1);
  const [orgs, setOrgs] = useState(savedOrgs);
  const [web3Provider, setWeb3Provider] = useState();
  const [delay, setDelay] = useState(5000);
  // const contractProcessor = useWeb3ExecuteFunction();

  // useEffect(() => {
  //   async function updateWeb3Provider() {
  //     if (!Moralis.web3._isProvider) {
  //       const web3Provider = await Moralis.enableWeb3();
  //       console.log(web3Provider);
  //       // setWeb3Provider();
  //     }
  //   }
  //   updateWeb3Provider();
  // }, [Moralis]);

  const updateReviewInfo = async () => {
    console.log("poll");
    await updateVotes();
    await updateReviews();
  };
  useInterval(updateReviewInfo, delay);

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
      message: "Please Connect Your Crypto Wallet",
      title: "Not Authenticated",
      position: "topL",
    });
  };

  const handleErrorNotification = (msg) => {
    dispatch({
      type: "error",
      message: " " + msg,
      title: "Error",
      position: "topL",
    });
  };

  const handleVoteNotification = () => {
    dispatch({
      type: "success",
      message: " Saved your vote!",
      title: "Success",
      position: "topL",
    });
  };

  const handleMintReviewNotification = () => {
    dispatch({
      type: "success",
      message: " Successfully saved your review!",
      title: "Success",
      position: "topL",
    });
  };
  const updateVotes = async () => {
    if (isWeb3Enabled) {
      const ethers = Moralis.web3Library;
      const org = selectedOrg ? selectedOrg : orgs[0];
      const reviews = org.Reviews;

      await Promise.all(
        reviews.map(async (review, index) => {
          const appraiserOrganization = new ethers.Contract(
            org.AppraiserOrganization,
            appraiserOrganization_abi.abi,
            Moralis.web3
          );
          review.Upvotes = (
            await appraiserOrganization.s_upvoteCount(review.reviewId)
          ).toString();
          review.Downvotes = (
            await appraiserOrganization.s_downvoteCount(review.reviewId)
          ).toString();
        })
      );
      org.NumRatings = org.Reviews.length;
      org.Reviews = reviews;

      // orgs[org.orgId] = org;
      // setOrgs(orgs);
      // setSelectedOrg(org);
    }
  };
  useEffect(() => {
    updateVotes(selectedTab, orgs, selectedOrg, Moralis, isWeb3Enabled);
  }, [selectedTab, orgs, selectedOrg, Moralis, isWeb3Enabled]);

  async function updateReviews() {
    if (isWeb3Enabled) {
      const ethers = Moralis.web3Library;
      Promise.all(
        orgs.map(async (org, index) => {
          const appraiserOrganization = new ethers.Contract(
            org.AppraiserOrganization,
            appraiserOrganization_abi.abi,
            Moralis.web3
          );

          const expectedReviews =
            (await appraiserOrganization.currentReviewId()).toNumber() - 1;
          const expectedIds = Array.from(
            { length: expectedReviews },
            (_, i) => i + 1
          );
          const reviewIds = org.Reviews.map((r) => r.reviewId);
          const expectedReviewIds = expectedIds.filter(
            doesNotContainsExistingIds(reviewIds)
          );

          // add new reviews
          if (expectedReviewIds.length !== 0) {
            expectedReviewIds.map(async (reviewId) => {
              const { author, id, isVerified, rating, review, unixtime } = {
                ...(await appraiserOrganization.s_reviews(reviewId)),
              };

              org.Reviews.push({
                Author: author,
                Rating: rating,
                Review: review,
                reviewId: id,
                Timestamp: unixtime,
              });
            });
          }

          Promise.all(
            org.Reviews.map(async (review, index) => {
              review.Upvotes = (
                await appraiserOrganization.s_upvoteCount(review.reviewId)
              ).toNumber();
              review.Downvotes = (
                await appraiserOrganization.s_downvoteCount(review.reviewId)
              ).toNumber();
              return review;
            })
          );
        })
      );

      setOrgs(orgs);
    }
  }
  useEffect(() => {
    updateReviews(selectedTab, orgs, selectedOrg, Moralis, isWeb3Enabled);
  }, [selectedTab, orgs, selectedOrg, Moralis, isWeb3Enabled]);

  function doesNotContainsExistingIds(reviewIds) {
    return (r) => {
      return !reviewIds.includes(r);
    };
  }

  const voteOnReview = async (reviewId, isUpvote) => {
    if (!isAuthenticated) {
      handleNewNotification();
    } else {
      const ethers = Moralis.web3Library;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const appraiserOrganization = new ethers.Contract(
        selectedOrg.AppraiserOrganization,
        appraiserOrganization_abi.abi,
        signer
      );

      if (isWeb3Enabled) {
        const hasVoted = await appraiserOrganization.hasVoted(
          account,
          reviewId
        );
        if (!hasVoted) {
          const tx = await appraiserOrganization.voteOnReview(
            account,
            reviewId,
            isUpvote
          );
          const receipt = await tx.wait();
          if (receipt.status === 0) {
            handleErrorNotification("Unknown error");
          } else {
            handleVoteNotification();
            await updateVotes();
          }
        } else {
          handleErrorNotification("You've already voted on this review");
        }
      }
    }
  };

  const mintReview = async (data) => {
    console.log("mint review");

    const ethers = Moralis.web3Library;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const reviewer = new ethers.Contract(
      contractAddress.Reviewer,
      reviewer_abi.abi,
      signer
    );
    const tx = await reviewer.mintReview(
      selectedOrg.orgId,
      data.data[1].inputResult,
      data.data[0].inputResult
    );
    const receipt = await tx.wait();
    if (receipt.status === 0) {
      handleErrorNotification("Unknown error");
    } else {
      handleMintReviewNotification();
    }
    setFormVisible(false);
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
            setSelectedTab(selectedKey);
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
                        setFormVisible(false);
                        // updateVotes(1);
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
                    setVisible(false);
                    setFormVisible(false);
                    setSelectedTab(1);
                    console.log("back");
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
            <div className="ownListContent"></div>
          </Tab>
        </TabList>
        {selectedOrg && (
          <div className="modal">
            <Modal
              onCloseButtonPressed={() => setVisible(false)}
              isVisible={visible}
              hasFooter={false}
              width="120vh"
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
                          setFormVisible(false);
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
                      onClick={() => {
                        setFormVisible(true);
                        setVisible(false);
                        setFormVisible(true);
                      }}
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
            <Modal
              onCloseButtonPressed={() => setFormVisible(false)}
              isVisible={formVisible}
              hasFooter={false}
              width="1000px"
            >
              <div className="modalContent">
                <img src={selectedOrg.Img} className="modalImg" alt=""></img>

                <div className="movieInfo">
                  <div className="description">
                    <Button
                      color="#6795b1"
                      icon="arrowCircleLeft"
                      iconLayout="icon-only"
                      id="add-review"
                      onClick={() => {
                        setFormVisible(false);
                        setVisible(true);
                      }}
                      radius={20}
                      theme="colored"
                      type="button"
                    />
                  </div>
                  <div
                    className=""
                    style={{ textAlign: "center", padding: "20px 50px" }}
                  >
                    <Form
                      buttonConfig={{
                        onClick: function noRefCheck() {},
                        theme: "primary",
                        text: "Save",
                      }}
                      data={[
                        {
                          inputWidth: "100%",
                          name: "Review",
                          type: "text",
                          validation: {
                            required: true,
                          },
                          value: "",
                        },
                        {
                          name: "Rating from 1-100",
                          type: "number",
                          validation: {
                            numberMax: 100,
                            numberMin: 1,
                            required: true,
                          },
                          value: "",
                        },
                      ]}
                      onSubmit={(data) => {
                        mintReview(data);
                      }}
                    />
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
