import React, { useContext, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Lobby from "../lobby/Lobby.jsx";
import { LoginContext } from "../../components/ui/LoginProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { getInputStyles } from "/src/styles/styles.js";

export function MemberFindPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const toast = useToast();
  const { onClose, onOpen, isOpen } = useDisclosure();
  const account = useContext(LoginContext);
  const inputStyles = getInputStyles();
  const [isLoading, setIsLoading] = useState(false);

  function handleFindPassword() {
    setIsLoading(true);
    axios
      .post("/api/member/sendEmail", { email })
      .then(() => {
        toast({
          status: "success",
          description: "임시 비밀번호가 발급되었습니다.",
          position: "bottom",
        });
        onClose();
      })
      .catch(() => {
        toast({
          status: "error",
          description: "해당 이메일이 존재하지 않습니다.",
          position: "bottom",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleCode() {
    setIsLoading(true);
    axios
      .post("/api/member/sendCode", { email })
      .then((response) => {
        setCode(response.data.toString());
        setIsCodeValid(false);
        toast({
          status: "success",
          description: "인증 코드가 발송되었습니다.",
          position: "bottom",
        });
        onOpen();
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          toast({
            status: "error",
            description: "해당 이메일이 존재하지 않습니다.",
            position: "bottom",
          });
        } else {
          toast({
            status: "error",
            description: "서버 오류가 발생했습니다.",
            position: "bottom",
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleVerifyCode() {
    if (inputCode === code) {
      setIsCodeValid(true);
      toast({
        status: "success",
        description: "인증 코드가 확인되었습니다.",
        position: "bottom",
      });
    } else {
      setIsCodeValid(false);
      toast({
        status: "error",
        description: "인증 코드가 잘못되었습니다.",
        position: "bottom",
      });
    }
  }

  if (account.isLoggedIn()) {
    return (
      <Box>
        <Lobby />;
      </Box>
    );
  }

  function handleSubmitKeyDown(e) {
    if (e.key === "Enter") {
      handleFindPassword();
    }
  }

  return (
    <Center>
      <Box w={500}>
        <Box>
          <Box mb={10}>
            <Heading>비밀번호 찾기</Heading>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>이메일</FormLabel>
              <Input
                style={inputStyles}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleSubmitKeyDown}
              />
            </FormControl>
          </Box>
          <Button
            onClick={handleCode}
            isLoading={isLoading}
            loadingText="인증코드 전송 중..."
          >
            인증코드 보내기
          </Button>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                인증하기
                <Button style={{ backgroundColor: "white" }} onClick={onClose}>
                  <FontAwesomeIcon icon={faXmark} size="lg" />
                </Button>
              </ModalHeader>
              <ModalBody>
                <InputGroup>
                  <Input
                    value={inputCode}
                    style={inputStyles}
                    onChange={(e) => setInputCode(e.target.value.trim())}
                  />
                  <InputRightElement w={"75px"} mr={1}>
                    <Button mt={2} onClick={handleVerifyCode}>
                      인증
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </ModalBody>
              <ModalFooter>
                {isCodeValid && (
                  <Button
                    onClick={handleFindPassword}
                    isLoading={isLoading}
                    loadingText="임시비밀번호 전송중..."
                  >
                    임시 비밀번호 발급
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </Box>
    </Center>
  );
}
