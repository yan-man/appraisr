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
import { divide, round } from "mathjs";
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
  const [selectedOrgId, setSelectedOrgId] = useState();
  const [selectedTab, setSelectedTab] = useState(1);
  const [orgs, setOrgs] = useState(savedOrgs);
  const [web3Provider, setWeb3Provider] = useState();
  // const [delay, setDelay] = useState(5000);
  const [myReviews, setMyReviews] = useState();
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

  // const updateReviewInfo = async () => {
  //   console.log("poll");
  //   await updateVotes();
  //   await updateOrgs();
  // };
  // useInterval(updateReviewInfo, 0);

  const dispatch = useNotification();

  useEffect(() => {
    async function updateReviewDetails() {
      const newOrgs = [...orgs];
      await Promise.all(
        newOrgs.map(async (org) => {
          org.NumRatings = org.Reviews.length;
          const sum = org.Reviews.reduce((total, next) => {
            return total + Number(next.Rating);
          }, 0);
          org.AvgRating = round(divide(sum, org.Reviews.length), 2);
        })
      );
    }
    updateReviewDetails();
  }, []);

  useEffect(() => {
    async function updateMyReviews() {
      if (!isAuthenticated) {
        return;
      }
      let myReviews = [];
      const newOrgs = [...orgs];
      await Promise.all(
        newOrgs.map(async (org) => {
          // console.log(org);

          const reviews = org.Reviews.filter((o) => {
            return o.Author.toLowerCase() === account;
          });
          reviews.map((r) => {
            r.org = org;
            return r;
          });
          myReviews = myReviews.concat(reviews);
          return;
        })
      );
      // console.log(myReviews);
      setMyReviews(myReviews);
    }
    updateMyReviews();
  }, [orgs, isAuthenticated]);

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
  const updateReviews = async () => {
    if (isWeb3Enabled) {
      const ethers = Moralis.web3Library;
      const org = selectedOrgId
        ? { ...orgs[selectedOrgId.id] }
        : { ...orgs[0] };
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
      const sum = reviews.reduce((total, next) => {
        return total + Number(next.Rating);
      }, 0);
      org.AvgRating = round(divide(sum, reviews.length), 2);

      const newOrgs = [...orgs];
      newOrgs[org.orgId] = org;

      setOrgs(newOrgs);
    }
  };
  useEffect(() => {
    updateReviews(selectedTab, selectedOrgId, Moralis, isWeb3Enabled);
  }, [selectedTab, selectedOrgId, Moralis, isWeb3Enabled]);

  async function updateOrgs() {
    if (isWeb3Enabled) {
      const ethers = Moralis.web3Library;
      const newOrgs = [...orgs];
      Promise.all(
        newOrgs.map(async (org, index) => {
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
                Rating: rating.toNumber(),
                Review: review,
                reviewId: id.toNumber(),
                Timestamp: unixtime.toNumber(),
                IsVerified: isVerified,
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

      // console.log(newOrgs);
      setOrgs(orgs);
    }
  }
  useEffect(() => {
    updateOrgs(selectedTab, selectedOrgId, Moralis, isWeb3Enabled);
  }, [selectedTab, selectedOrgId, Moralis, isWeb3Enabled]);

  function doesNotContainsExistingIds(reviewIds) {
    return (r) => {
      return !reviewIds.includes(r);
    };
  }

  const voteOnReview = async (reviewId, isUpvote) => {
    if (!isAuthenticated) {
      handleNewNotification();
      return;
    }

    const ethers = Moralis.web3Library;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const appraiserOrganization = new ethers.Contract(
      orgs[selectedOrgId.id].AppraiserOrganization,
      appraiserOrganization_abi.abi,
      signer
    );

    if (
      orgs[selectedOrgId.id].Reviews[reviewId - 1].Author.toLowerCase() ===
      account.toLowerCase()
    ) {
      handleErrorNotification(
        "C'mon bruh, you can't vote on your own review..."
      );
      return;
    }

    const hasVoted = await appraiserOrganization.hasVoted(account, reviewId);
    if (hasVoted) {
      handleErrorNotification("You've already voted on this review");
      return;
    }

    const tx = await appraiserOrganization.voteOnReview(
      account,
      reviewId,
      isUpvote
    );
    const receipt = await tx.wait();
    if (receipt.status === 0) {
      handleErrorNotification("Unknown error");
      return;
    }

    await updateReviews();
  };

  const mintReview = async (data) => {
    console.log("mint review");

    if (data.data.length !== 2) return false;

    const ethers = Moralis.web3Library;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const reviewer = new ethers.Contract(
      contractAddress.Reviewer,
      reviewer_abi.abi,
      signer
    );
    const tx = await reviewer.mintReview(
      orgs[selectedOrgId.id].orgId,
      data.data[1].inputResult,
      data.data[0].inputResult
    );
    const receipt = await tx.wait();

    // console.log(await reviewer.s_reviews(orgs[selectedOrgId.id].orgId, 3));
    // console.log(await reviewer.s_reviews(orgs[selectedOrgId.id].orgId, 4));

    if (receipt.status === 0) {
      handleErrorNotification("Unknown error");
      return;
    } else {
      // console.log(receipt.events);
      handleMintReviewNotification();
      await updateOrgs();
      setSelectedOrgId({ id: 0 });
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
                  <h2 className="rating">
                    Avg Rating: {round(divide(orgs[0].AvgRating, 10), 2)}
                  </h2>
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
                        setSelectedOrgId({ id: 0 });
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
                        setSelectedOrgId({ id: e.orgId });
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
                  }}
                />
                <h1 style={{ color: "#6795b1" }}>
                  {selectedOrgId && orgs[selectedOrgId.id].Name}
                </h1>
                <h2 style={{ color: "#6795b1" }}>
                  <em>{selectedOrgId && orgs[selectedOrgId.id].Description}</em>
                </h2>
                <p style={{ color: "white" }}>Reviews</p>
              </div>
              <div className="ownThumbs">
                {selectedOrgId && orgs[selectedOrgId.id].Reviews ? (
                  orgs[selectedOrgId.id].Reviews.map((r, index) => {
                    return (
                      <div
                        className="review-card"
                        key={index}
                        style={{ maxWidth: "500px" }}
                      >
                        {r.IsVerified && (
                          <div>
                            <Icon fill="#21BF96" size={24} svg="check" />
                          </div>
                        )}

                        <div className="review" style={{ margin: "0px" }}>
                          <p style={{ paddingBottom: "20px" }}>
                            Author:{" "}
                            {account && r.Author.toLowerCase() === account
                              ? `ME (${r.Author})`
                              : r.Author}
                          </p>
                          <p>Rating: {divide(r.Rating, 10)} / 10</p>
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
                            <Icon fill="#ffffff" size={24} svg="triangleDown" />
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
            </div>
          </Tab>

          <Tab tabKey={3} tabName={"MyReviews"} isDisabled={!isAuthenticated}>
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
                  }}
                />
                <h1 style={{ color: "#6795b1" }}>My Reviews</h1>
              </div>
              <div className="ownThumbs">
                {myReviews && myReviews ? (
                  myReviews.map((r, index) => {
                    return (
                      <div
                        className="review-card"
                        key={index}
                        style={{ maxWidth: "500px" }}
                      >
                        {r.IsVerified && (
                          <div>
                            <Icon fill="#21BF96" size={24} svg="check" />
                          </div>
                        )}

                        <div className="review" style={{ margin: "0px" }}>
                          <p style={{ paddingBottom: "20px" }}>{r.org.Name}</p>
                          <p>Rating: {divide(r.Rating, 10)} / 10</p>
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
                            <Icon fill="#ffffff" size={24} svg="triangleDown" />
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
            </div>
          </Tab>
        </TabList>
        {selectedOrgId && (
          <div className="modal">
            <Modal
              onCloseButtonPressed={() => setVisible(false)}
              isVisible={visible}
              hasFooter={false}
              width="120vh"
            >
              <div className="modalContent">
                <img
                  src={orgs[selectedOrgId.id].Img}
                  className="modalImg"
                  alt=""
                ></img>

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
                        if (!isAuthenticated) {
                          handleNewNotification();
                          return;
                        }
                        setFormVisible(true);
                        setVisible(false);
                      }}
                      radius={20}
                      theme="colored"
                      type="button"
                    />
                  </div>
                  <div className="description" style={{ textAlign: "center" }}>
                    {orgs[selectedOrgId.id].Description}
                  </div>
                  <div className="description">
                    Category:
                    <span className="deets">
                      {orgs[selectedOrgId.id].Category}
                    </span>
                  </div>
                  <div
                    className="description"
                    style={{ fontSize: "150%", color: "#6795b1" }}
                  >
                    Avg Rating:{" "}
                    {round(divide(orgs[selectedOrgId.id].AvgRating, 10), 2)}
                  </div>
                  <div className="description">
                    Total Reviews: {orgs[selectedOrgId.id].NumRatings}
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
                <img
                  src={orgs[selectedOrgId.id].Img}
                  className="modalImg"
                  alt=""
                ></img>

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
