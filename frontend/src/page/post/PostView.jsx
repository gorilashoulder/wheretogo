import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { LoginContext } from "../../component/LoginProvider.jsx";
import CommentComponent from "../../component/Comment/CommentComponent.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretRight,
  faHeart as emptyHeart,
  faList,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as fullHeart } from "@fortawesome/free-regular-svg-icons";
import MapView from "../../component/Map/MapView.jsx";

const Viewer = styled.div`
  width: calc(50% - 40px);
  height: 400px;
  padding: 20px;
  margin-top: 20px;
  border: 2px solid gray;
`;

export function PostView() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [place, setPlace] = useState([]);
  const [like, setLike] = useState({ like: false, count: 0 });
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [comment, setComment] = useState({ count: 0 });
  const [toggle, setToggle] = useState("");
  const account = useContext(LoginContext);
  const navigate = useNavigate();
  const [isTransition, setIsTransition] = useState(false);
  const toast = useToast();
  const [banner, setBanner] = useState(null);
  const [file, setFile] = useState(null);
  const {
    isOpen: isModalOpenOfDelete,
    onOpen: onModalOpenOfDelete,
    onClose: onModalCloseOfDelete,
  } = useDisclosure();

  const {
    isOpen: isModalOpenOfBanner,
    onOpen: onModalOpenOfBanner,
    onClose: onModalCloseOfBanner,
  } = useDisclosure();

  const {
    isOpen: isModalOpenPop,
    onOpen: onModalOpenPop,
    onClose: onModalClosePop,
  } = useDisclosure();

  useEffect(() => {
    axios
      .get(`/api/post/${postId}`)
      .then((res) => {
        setPost(res.data.post);
        setLike(res.data.like);
        setComment({ count: res.data.commentCount });
        setBanner(
          "https://kooreungsbucket.s3.ap-northeast-2.amazonaws.com/prj3/167/defaultProfile.png",
        );
      })
      .catch((err) => {
        navigate("/post/list");
        if (err.response.status === 404) {
          toast({
            status: "error",
            description: "해당 게시물이 존재하지 않습니다.",
            position: "bottom",
          });
        }
      });
  }, [isLikeLoading, isTransition]);

  useEffect(() => {
    axios.get(`/api/post/${postId}/place`).then((res) => {
      setPlace(res.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get(`/api/post/${postId}/getMdPick`)
      .then((res) => {
        setToggle(res.data);
        console.log(res.data);
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  // 게시글 번호 확인
  if (post === null || post === undefined) {
    return <Spinner />;
  }

  // 게시글 좋아요 클릭 시
  function handleLikeCount() {
    if (!account.isLoggedIn()) {
      return;
    }
    setIsLikeLoading(true);
    axios
      .put("/api/post/like", { postId: post.postId })
      .then((res) => {
        setLike(res.data);
      })
      .catch(() => {})
      .finally(() => {
        setIsLikeLoading(false);
      });
  }

  // 게시글 삭제 클릭 시
  function handleClickDelete() {
    axios
      .delete(`/api/post/${postId}`)
      .then(() => {
        navigate(`/post/list`);
        toast({
          status: "success",
          position: "bottom",
          description: "게시글이 삭제되었습니다.",
        });
      })
      .catch(() => {
        toast({
          status: "error",
          position: "bottom",
          description: "게시글 삭제를 실패하였습니다.",
        });
      })
      .finally(() => {
        onModalCloseOfDelete();
      });
  }

  // mdpick push
  function handleMdPickPush() {
    if (!file) {
      toast({
        status: "warning",
        position: "bottom",
        description: "배너를 꼭 넣어주세요.",
      });
      return; // file이 null이면 여기서 함수 실행을 중단합니다.
    }

    axios
      .postForm(`/api/post/${postId}/push`, { postId: post.postId, file })
      .then(() => {
        toast({
          status: "success",
          position: "bottom",
          description: "성공",
        });
        window.location.reload();
      })
      .catch(() => {
        toast({
          status: "error",
          position: "bottom",
          description: "push 할 수 있는 게시물을 초과하였습니다.",
        });
      })
      .finally(() => {});
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      setFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setBanner(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setBanner(
        "https://kooreungsbucket.s3.ap-northeast-2.amazonaws.com/prj3/images.jpg",
      );
    }
  }

  // mdpick pop
  function handleMdPickPop() {
    axios
      .post(`/api/post/${postId}/pop`, { postId: post.postId })
      .then(() => {
        toast({
          status: "success",
          position: "bottom",
          description: "성공",
        });
        window.location.reload();
      })
      .catch(() => {
        toast({
          status: "error",
          position: "bottom",
          description: "실패",
        });
      })
      .finally(() => {});
  }

  return (
    <Flex direction="column" align="center">
      <Flex direction="column" align="center">
        <Grid
          w={{ base: "720px", lg: "1080px" }}
          h={"80px"}
          my={"32px"}
          templateColumns={"repeat(5,1fr)"}
          templateRows={"1fr 1fr"}
        >
          <GridItem
            rowSpan={1}
            colSpan={1}
            alignContent={"center"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
          >
            <Flex pl={3}>
              <Text>
                지역 <FontAwesomeIcon icon={faCaretRight} />
              </Text>
            </Flex>
          </GridItem>
          <GridItem
            rowSpan={1}
            colSpan={4}
            alignContent={"center"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
          >
            <Flex pl={3}>
              <Text display={{ base: "none", lg: "block" }} mr={1}>
                제목 <FontAwesomeIcon icon={faCaretRight} />
              </Text>
              <Text overflow={"hidden"} textOverflow={"ellipsis"}>
                {post.title}
              </Text>
            </Flex>
          </GridItem>
          <GridItem
            rowSpan={1}
            colSpan={1}
            alignContent={"center"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
          >
            <Flex pl={3}>
              <Text display={{ base: "none", lg: "block" }} mr={1}>
                작성자 <FontAwesomeIcon icon={faCaretRight} />
              </Text>
              <Text>{post.nickName}</Text>
            </Flex>
          </GridItem>
          <GridItem
            rowSpan={1}
            colSpan={1}
            alignContent={"center"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
          >
            <Flex pl={3}>
              <Text display={{ base: "none", lg: "block" }} mr={1}>
                조회수 <FontAwesomeIcon icon={faCaretRight} />
              </Text>
              <Text>{post.view}</Text>
            </Flex>
          </GridItem>
          <GridItem
            rowSpan={1}
            colSpan={1}
            alignContent={"center"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
          >
            <Flex pl={3}>
              <Text display={{ base: "none", lg: "block" }} mr={1}>
                좋아요 <FontAwesomeIcon icon={faCaretRight} />
              </Text>
              <Text>{like.count}</Text>
            </Flex>
          </GridItem>
          <GridItem
            rowSpan={1}
            colSpan={1}
            alignContent={"center"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
          >
            <Flex pl={3}>
              <Text display={{ base: "none", lg: "block" }} mr={1}>
                댓글 <FontAwesomeIcon icon={faCaretRight} />
              </Text>
              <Text>{comment.count}</Text>
            </Flex>
          </GridItem>
          <GridItem
            rowSpan={1}
            colSpan={1}
            alignContent={"center"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
          >
            <Flex pl={3}>
              <Text display={{ base: "none", lg: "block" }} mr={1}>
                작성일자 <FontAwesomeIcon icon={faCaretRight} />{" "}
              </Text>
              <Text>{post.createDate}</Text>
            </Flex>
          </GridItem>
        </Grid>
        <Box w={"576px"} h={"360px"} bg={"lightgray"} my={"32px"}>
          <MapView />
        </Box>
        <Flex
          w={{ base: "720px", lg: "1080px" }}
          h={"160px"}
          bg={"lightgray"}
          my={"32px"}
          justify={"space-evenly"}
          alignItems={"center"}
        >
          {place.map((place, index) => (
            <Box key={index}>
              <Box>
                <Box>{place.placeName}</Box>
                <Box>{place.address}</Box>
                <Box>게시글에 등록 된 횟수 : {place.countPlace} 건</Box>
              </Box>
            </Box>
          ))}
        </Flex>
      </Flex>
      <Box
        w={"720px"}
        // h={"360px"}
        bg={"lightgray"}
        my={"32px"}
        p={"1rem"}
        whiteSpace={"pre-wrap"}
      >
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        {/*<Box>{post.content}</Box>*/}
      </Box>

      <Divider border={"1px solid lightGray"} w={"720px"} />
      {/* 좋아요 & 수정/삭제/목록 버튼 */}
      <Flex w={"720px"} h={"64px"} my={"16px"} align={"center"}>
        {/* 좋아요 */}
        <Tooltip
          isDisabled={account.isLoggedIn()}
          hasArrow
          label={"로그인 해주세요"}
        >
          <Button onClick={handleLikeCount}>
            <Flex align={"center"} gap={1}>
              <Text fontSize={"xl"}>
                {like.like && <FontAwesomeIcon icon={emptyHeart} />}
                {like.like || <FontAwesomeIcon icon={fullHeart} />}
              </Text>
              <Text fontSize={"xl"} display={{ base: "none", lg: "block" }}>
                좋아요
              </Text>
              <Text fontSize={"xl"}>{like.count}</Text>
            </Flex>
          </Button>
        </Tooltip>
        <Spacer />
        {/* PUSH & POP 버튼 */}
        {account.isAdmin() && (
          <Box>
            <Box align={"left"} my={10}>
              {toggle === "x" && (
                <Button onClick={onModalOpenOfBanner}>Push</Button>
              )}
              {toggle === "o" && <Button onClick={onModalOpenPop}>Pop</Button>}
            </Box>
            <Modal isOpen={isModalOpenPop} onClose={onModalClosePop}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>MD PICK 제거</ModalHeader>
                <ModalBody>게시글을 제거하시겠습니까?</ModalBody>
                <ModalFooter>
                  <Button onClick={handleMdPickPop}>제거</Button>
                  <Button onClick={onModalClosePop}>취소</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>

        )}
        {/* 수정 및 삭제 버튼 */}
        {account.hasAccessMemberId(post.memberId) ||
          (account.isAdmin() && (
            <Box>
              <Box align={"left"} my={10}>
                <Button onClick={() => navigate(`/post/${postId}/edit`)}>
                  <FontAwesomeIcon icon={faPenToSquare} />
                  <Text display={{ base: "none", lg: "block" }} ml={1}>
                    수정
                  </Text>
                </Button>
                <Button onClick={onModalOpenOfDelete}>
                  <FontAwesomeIcon icon={faTrash} />
                  <Text display={{ base: "none", lg: "block" }} ml={1}>
                    삭제
                  </Text>
                </Button>
              </Box>
            </Box>
          ))}

        {/* 목록 */}
        <Button onClick={() => navigate("/post/list")}>
          <FontAwesomeIcon icon={faList} />
          <Text display={{ base: "none", lg: "block" }} ml={1}>
            목록
          </Text>
        </Button>
      </Flex>
      {/*댓글*/}
      <CommentComponent
        postId={post.postId}
        isTransition={isTransition}
        setIsTransition={setIsTransition}
      />

      <Modal isOpen={isModalOpenOfDelete} onClose={onModalCloseOfDelete}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>게시글 삭제</ModalHeader>
          <ModalBody>게시글을 삭제하시겠습니까?</ModalBody>
          <ModalFooter>
            <Button onClick={handleClickDelete}>삭제</Button>
            <Button onClick={onModalCloseOfDelete}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isModalOpenOfBanner} onClose={onModalCloseOfBanner}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>배너등록</ModalHeader>
          <ModalBody>배너를 등록 해주세요</ModalBody>
          <Avatar
            name="defaultProfile"
            src={banner}
            w="200px"
            h="200px"
            mb={30}
          />
          <Box mb={7}>
            <FormControl>
              <FormLabel>배너를 선택해주세요</FormLabel>
              <Input
                multiple
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <FormHelperText>
                총 용량은 10MB, 한 파일은 1MB를 초과할 수 없습니다.
              </FormHelperText>
            </FormControl>
          </Box>
          <ModalFooter>
            <Button onClick={handleMdPickPush}>등록</Button>
            <Button onClick={onModalCloseOfBanner}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
