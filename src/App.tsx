import { useEffect, useState } from "react"
import axios from "axios"

import {
  Alert,
  Box,
  Button,
  Clipboard,
  ClientOnly,
  Container,
  Dialog,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Skeleton,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"

import { useColorMode } from "@/components/ui/color-mode"

import {
  LuCircleAlert,
  LuMoon,
  LuPlus,
  LuSun,
  LuTrash2,
} from "react-icons/lu"

const API_URL = "/api/cfl"

const translations: Record<string, string> = {
  Success: "Nhập code thành công!",
  "Active code: campaign status not active":
    "Sự kiện đã kết thúc hoặc chưa bắt đầu",
  "Active code fail": "Mã quà tặng không chính xác",
  "Active code: other error": "Hệ thống bận, vui lòng thử lại sau",
  "Active code: user code management quantity exhausted":
    "Bạn đã nhận loại mã này rồi",
  "Account not online or not exist":
    "Nhân vật không tồn tại hoặc đang offline",
  "Tất cả server đã đạt giới hạn":
    "Hết lượt nhập code hôm nay, hãy quay lại vào ngày mai!",
  "Tất cả server đang bận":
    "Máy chủ đang quá tải, vui lòng đợi trong giây lát",
  "Code expired": "Mã này đã hết hạn sử dụng",
  "Code limit reached": "Mã này đã đạt giới hạn lượt nhập",
  "Invalid format": "Định dạng mã không hợp lệ",
  "Server mismatch": "Mã không áp dụng cho máy chủ này",
}

type LogItem = {
  code: string
  success: boolean
  message: string
}

type SavedRole = {
  roleId: string
  roleName: string
  level: string
  serverId: string
}

function ThemeToggle() {
  const { toggleColorMode, colorMode } = useColorMode()

  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="outline"
        size="sm"
        aria-label="theme"
      >
        {colorMode === "light" ? <LuSun /> : <LuMoon />}
      </IconButton>
    </ClientOnly>
  )
}

export default function App() {
  const [roleId, setRoleId] = useState("")
  const [codes, setCodes] = useState("")
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<LogItem[]>([])

  const [openModal, setOpenModal] = useState(false)
  const [saveRoleLoading, setSaveRoleLoading] =
    useState(false)

  const [savedRoles, setSavedRoles] = useState<
    SavedRole[]
  >([])

  const [newRoleId, setNewRoleId] = useState("")

  const [modalAlert, setModalAlert] = useState<{
    status: "error" | "warning" | "success"
    message: string
  } | null>(null)

  useEffect(() => {
    const data =
      localStorage.getItem("saved_roles")

    if (data) {
      setSavedRoles(JSON.parse(data))
    }
  }, [])

  const saveRoles = (roles: SavedRole[]) => {
    setSavedRoles(roles)

    localStorage.setItem(
      "saved_roles",
      JSON.stringify(roles),
    )
  }

  const handleSaveRole = async () => {
    setModalAlert(null)

    if (!newRoleId.trim()) {
      setModalAlert({
        status: "error",
        message: "Vui lòng nhập ID nhân vật",
      })

      return
    }

    const exists = savedRoles.find(
      (i) => i.roleId === newRoleId,
    )

    if (exists) {
      setModalAlert({
        status: "warning",
        message: "ID đã tồn tại trong danh sách",
      })

      return
    }

    try {
      setSaveRoleLoading(true)

      const response = await axios.post(
        "/api/get-role",
        {
          roleID: newRoleId,
        },
      )

      const data = response.data

      const item =
        data?.data ||
        data?.result ||
        data?.user ||
        data

      const roleName =
        item?.roleName ||
        item?.name ||
        item?.nickname ||
        ""

      if (
        !roleName ||
        roleName === newRoleId ||
        String(roleName)
          .toLowerCase()
          .includes("không được tìm thấy")
      ) {
        setModalAlert({
          status: "error",
          message:
            "Nhân vật không được tìm thấy trong khu vực này. Vui lòng kiểm tra lại thông tin hoặc server tương ứng.",
        })

        return
      }

     const roleItem: SavedRole = {
        roleId: newRoleId,
        roleName,
        level: String(
        item?.info?.level ||
        item?.level ||
       "",
      ),
        serverId: String(
        item?.serverId ||
        item?.serverID ||
       "",
      ),
     }

      const updated = [
        roleItem,
        ...savedRoles,
      ]

      saveRoles(updated)

      setModalAlert({
        status: "success",
        message: "Lưu ID thành công",
      })

      setNewRoleId("")
    } catch (error: any) {
      setModalAlert({
        status: "error",
        message:
          error?.response?.data?.message ||
          "Không thể lấy thông tin nhân vật",
      })
    } finally {
      setSaveRoleLoading(false)
    }
  }

  const handleDeleteRole = (
    roleIdDelete: string,
  ) => {
    const updated = savedRoles.filter(
      (i) => i.roleId !== roleIdDelete,
    )

    saveRoles(updated)
  }

  const handleSelectRole = (
    selectedRoleId: string,
  ) => {
    setRoleId(selectedRoleId)

    setOpenModal(false)
  }

  const handleSubmit = async () => {
    if (!roleId.trim()) {
      alert("Vui lòng nhập ID nhân vật")
      return
    }

    const codeList = [
      ...new Set(
        codes
          .split("\n")
          .map((i) => i.trim())
          .filter(Boolean),
      ),
    ]

    if (!codeList.length) {
      alert("Vui lòng nhập giftcode")
      return
    }

    setLoading(true)

    setLogs([])

    for (const code of codeList) {
      try {
        const payload = {
          _targetServerId: Number(roleId),
          serverId: "101",
          gameCode: "A49",
          roleId,
          roleName: roleId,
          code,
        }

        const response = await axios.post(
          API_URL,
          payload,
        )

        let rawMessage =
          response.data?.message ||
          response.data?.msg ||
          response.data?.data?.message ||
          "Success"

        let message = rawMessage

        Object.entries(translations).forEach(
          ([en, vi]) => {
            if (message.includes(en)) {
              message = vi
            }
          },
        )

        const success =
          rawMessage.includes("Success") ||
          message === "Nhập code thành công!"

        setLogs((prev) => [
          {
            code,
            success,
            message,
          },
          ...prev,
        ])
      } catch (error: any) {
        let message =
          error?.response?.data?.message ||
          error?.response?.data?.msg ||
          error?.message ||
          "Lỗi kết nối"

        Object.entries(translations).forEach(
          ([en, vi]) => {
            if (message.includes(en)) {
              message = vi
            }
          },
        )

        setLogs((prev) => [
          {
            code,
            success: false,
            message,
          },
          ...prev,
        ])
      }
    }

    setLoading(false)
  }

  return (
    <Container maxW="2xl" py="10">
      <Flex
        justify="space-between"
        align="center"
        mb="8"
      >
        <Box>
          <Heading size="lg">
            Auto Nhập Code CFL
          </Heading>

          <Text mt="1" opacity={0.7}>
            Tool nhập giftcode Crossfire Legends
          </Text>
        </Box>

        <ThemeToggle />
      </Flex>

      <VStack gap="5" align="stretch">
        <Box>
          <Flex
            justify="space-between"
            align="center"
            mb="2"
          >
            <Text fontWeight="600">
              ID Nhân vật
            </Text>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setOpenModal(true)
              }
            >
              Danh Sách ID (
              {savedRoles.length} ID)
            </Button>
          </Flex>

          <Input
            placeholder="Nhập ID nhân vật"
            value={roleId}
            onChange={(e) =>
              setRoleId(e.target.value)
            }
          />
        </Box>

        <Box>
          <Flex
            justify="space-between"
            align="center"
            mb="2"
          >
            <Text fontWeight="600">
              Danh sách Giftcode
            </Text>

            <Clipboard.Root value={codes}>
              <Clipboard.Trigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                >
                  <Clipboard.Indicator />
                  Copy
                </Button>
              </Clipboard.Trigger>
            </Clipboard.Root>
          </Flex>

          <Textarea
            placeholder="Mỗi dòng 1 giftcode"
            minH="220px"
            resize="vertical"
            value={codes}
            onChange={(e) =>
              setCodes(e.target.value)
            }
          />
        </Box>

        <Button
          colorPalette="blue"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading
            ? "Đang nhập code..."
            : "Bắt đầu nhập"}
        </Button>

        <Box
          borderWidth="1px"
          rounded="xl"
          p="4"
          maxH="400px"
          overflowY="auto"
        >
          <Text fontWeight="700" mb="3">
            Nhật ký
          </Text>

          <VStack align="stretch">
            {logs.length === 0 && (
              <Text opacity={0.6}>
                Chưa có dữ liệu
              </Text>
            )}

            {logs.map((log, index) => (
              <Box
                key={index}
                p="3"
                rounded="lg"
                borderWidth="1px"
                borderColor={
                  log.success
                    ? "green.500"
                    : "red.500"
                }
              >
                <Text fontWeight="700">
                  {log.code}
                </Text>

                <Text
                  mt="1"
                  color={
                    log.success
                      ? "green.500"
                      : "red.500"
                  }
                >
                  {log.message}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>

      <Dialog.Root
        open={openModal}
        onOpenChange={(e) =>
          setOpenModal(e.open)
        }
      >
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                Danh Sách ID
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack
                align="stretch"
                gap="4"
              >
                <HStack>
                  <Input
                    placeholder="Nhập ID nhân vật"
                    value={newRoleId}
                    onChange={(e) =>
                      setNewRoleId(
                        e.target.value,
                      )
                    }
                  />

                  <Button
                    colorPalette="blue"
                    loading={
                      saveRoleLoading
                    }
                    onClick={
                      handleSaveRole
                    }
                  >
                    <LuPlus />
                    Lưu ID
                  </Button>
                </HStack>

                {modalAlert && (
                  <Alert.Root
                    status={
                      modalAlert.status
                    }
                    rounded="lg"
                  >
                    <Alert.Indicator>
                      <LuCircleAlert />
                    </Alert.Indicator>

                    <Alert.Content>
                      <Alert.Title fontSize="sm">
                        {
                          modalAlert.message
                        }
                      </Alert.Title>
                    </Alert.Content>
                  </Alert.Root>
                )}

                <VStack
                  align="stretch"
                  maxH="400px"
                  overflowY="auto"
                >
                  {savedRoles.length ===
                    0 && (
                    <Text opacity={0.6}>
                      Chưa có ID nào
                    </Text>
                  )}

                  {savedRoles.map(
                    (item) => (
                      <Flex
                        key={
                          item.roleId
                        }
                        p="3"
                        borderWidth="1px"
                        rounded="lg"
                        justify="space-between"
                        align="center"
                        gap="3"
                      >
                        <Box
                          flex="1"
                          cursor="pointer"
                          onClick={() =>
                            handleSelectRole(
                              item.roleId,
                            )
                          }
                        >
                          <Text fontWeight="700">
                            {
                              item.roleName
                            }
                          </Text>

                          <Text fontSize="sm">
                            ID:{" "}
                            {
                              item.roleId
                            }
                          </Text>

                          <Text fontSize="sm">
                            Level:{" "}
                            {item.level ||
                              "?"}
                          </Text>

                          <Text fontSize="sm">
                            Server:{" "}
                            {item.serverId ||
                              "?"}
                          </Text>
                        </Box>

                        <HStack>
                          <IconButton
                            aria-label="select"
                            colorPalette="blue"
                            variant="ghost"
                            onClick={() =>
                              handleSelectRole(
                                item.roleId,
                              )
                            }
                          >
                            <LuPlus />
                          </IconButton>

                          <IconButton
                            aria-label="delete"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() =>
                              handleDeleteRole(
                                item.roleId,
                              )
                            }
                          >
                            <LuTrash2 />
                          </IconButton>
                        </HStack>
                      </Flex>
                    ),
                  )}
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                onClick={() =>
                  setOpenModal(false)
                }
              >
                Đóng
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Container>
  )
}
