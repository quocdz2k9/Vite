import { useEffect, useMemo, useState } from "react"
import axios from "axios"

import {
  Alert,
  Badge,
  Box,
  Button,
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
  LuChevronDown,
  LuChevronUp,
  LuCircleAlert,
  LuMoon,
  LuPlus,
  LuSun,
  LuTrash2,
} from "react-icons/lu"

const API_URL = "/api/cfl"

const PRESET_CODES = [
  "LIKE500KCFL",
  "CFLTOP1APP",
  "CFLTOP1GG",
  "TOP1APPLECFL",
  "LK3KUKRLI06W7CTOA",
  "BAOLAOBLABLA",
  "SMILEGGCOLEN",
  "VOTAYSMILEGG",
  "SMILEGGWIN",
  "SMILEGGCFL",
  "SMILEGG500VIEW",
  "SMILEGGSMILE",
  "BAOLAO4CFL",
  "BAOLAOLIVESTR",
  "BAOLAO10DIEM",
  "ZOZOMAIDINH",
  "SIEUNHANZOZO",
  "ZOZOCFL20",
  "3000SHOWMCRTV",
  "XATHUZOZO",
  "ZOZOREACH500",
  "CFLGAMEVERSE",
  "TOANDANF11",
  "2026CFLKHAIHOA",
  "HUYENTHOAICF",
  "LIKE1KOBCFL",
  "HANOI1KXCAUVS",
  "HANOI2KX5AUVS",
  "HANOI3KXCPMMN",
  "DANANG1KMX92WK",
  "HCM1KASPO29S",
  "HCM3KASMCSS",
  "HCM4KAS99DNS",
  "YUNY2CCU",
  "LIVES5CCU",
  "NANZB2CCU",
  "APRIL1500FOOL",
  "APRILFOOL1000",
  "HAPPYAPRILFOOL",
  "500VIEWCRTSHW",
  "BAOLAOFOOL",
  "BAOLAOSPY",
  "BAOLAOMASOI",
  "BAOLAOC4BL",
  "BAOLAOGRC4",
  "BAOLAOVUIVE",
  "CFLSHOOTFORWIN",
  "CFLFORYOURDAY",
  "CFLVOTINGTIME",
  "CRTREACH1000V",
  "2000LIVEVWCRT",
  "MEEEELOOO",
  "VUYPWAMELO",
  "HELLOMELO",
  "MELOTOP1CFL",
  "500MELO500",
  "HCM2KASP929S",
  "CFLPLAYNOW",
  "ZOZOVODICH",
  "THANTOCCFL01",
]

const translations: Record<string, string> = {
  Success: "Nhập code thành công!",
  "Active code: campaign status not active":
    "Sự kiện đã kết thúc hoặc chưa bắt đầu",
  "Active code fail": "Mã quà tặng không chính xác",
  "Active code: other error":
    "Hệ thống bận, vui lòng thử lại sau",
  "Active code: user code management quantity exhausted":
    "Bạn đã nhận loại mã này rồi",
  "Account not online or not exist":
    "Nhân vật không tồn tại hoặc đang offline",
  "Tất cả server đã đạt giới hạn":
    "Hết lượt nhập code hôm nay, hãy quay lại vào ngày mai!",
  "Tất cả server đang bận":
    "Máy chủ đang quá tải, vui lòng đợi trong giây lát",
  "Code expired":
    "Mã này đã hết hạn sử dụng",
  "Code limit reached":
    "Mã này đã đạt giới hạn lượt nhập",
  "Invalid format":
    "Định dạng mã không hợp lệ",
  "Server mismatch":
    "Mã không áp dụng cho máy chủ này",
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
  const { toggleColorMode, colorMode } =
    useColorMode()

  return (
    <ClientOnly
      fallback={<Skeleton boxSize="8" />}
    >
      <IconButton
        onClick={toggleColorMode}
        variant="outline"
        size="sm"
        aria-label="theme"
      >
        {colorMode === "light" ? (
          <LuSun />
        ) : (
          <LuMoon />
        )}
      </IconButton>
    </ClientOnly>
  )
}

export default function App() {
  const [roleId, setRoleId] =
    useState("")

  const [codes, setCodes] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [logs, setLogs] = useState<
    LogItem[]
  >([])

  const [openModal, setOpenModal] =
    useState(false)

  const [
    saveRoleLoading,
    setSaveRoleLoading,
  ] = useState(false)

  const [savedRoles, setSavedRoles] =
    useState<SavedRole[]>([])

  const [newRoleId, setNewRoleId] =
    useState("")

  const [showAllCodes, setShowAllCodes] =
    useState(false)

  const [modalAlert, setModalAlert] =
    useState<{
      status:
        | "error"
        | "warning"
        | "success"
      message: string
    } | null>(null)

  useEffect(() => {
    const data =
      localStorage.getItem(
        "saved_roles",
      )

    if (data) {
      setSavedRoles(JSON.parse(data))
    }
  }, [])

  const saveRoles = (
    roles: SavedRole[],
  ) => {
    setSavedRoles(roles)

    localStorage.setItem(
      "saved_roles",
      JSON.stringify(roles),
    )
  }

  const totalCodes = useMemo(() => {
    return codes
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean).length
  }, [codes])

  const successCount = useMemo(() => {
    return logs.filter(
      (i) => i.success,
    ).length
  }, [logs])

  const failCount = useMemo(() => {
    return logs.filter(
      (i) => !i.success,
    ).length
  }, [logs])

  const selectedCodes = useMemo(() => {
    return codes
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean)
  }, [codes])

  const handleSaveRole = async () => {
    setModalAlert(null)

    if (!newRoleId.trim()) {
      setModalAlert({
        status: "error",
        message:
          "Vui lòng nhập ID nhân vật",
      })

      return
    }

    const exists = savedRoles.find(
      (i) => i.roleId === newRoleId,
    )

    if (exists) {
      setModalAlert({
        status: "warning",
        message:
          "ID đã tồn tại trong danh sách",
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
        item?.info?.charac_name ||
        ""

      if (
        !roleName ||
        roleName === newRoleId ||
        String(roleName)
          .toLowerCase()
          .includes(
            "không được tìm thấy",
          )
      ) {
        setModalAlert({
          status: "error",
          message:
            "Nhân vật không được tìm thấy trong khu vực này. Vui lòng kiểm tra lại thông tin hoặc server tương ứng.",
        })

        return
      }

      const roleItem: SavedRole = {
        roleId: String(
          item?.roleID ||
            item?.roleId ||
            newRoleId,
        ),

        roleName,

        level: String(
          item?.info?.level ||
            item?.level ||
            "",
        ),

        serverId: String(
          item?.serverID ||
            item?.serverId ||
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
          error?.response?.data
            ?.message ||
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
      (i) =>
        i.roleId !== roleIdDelete,
    )

    saveRoles(updated)
  }

  const handleSelectRole = (
    selectedRoleId: string,
  ) => {
    setRoleId(selectedRoleId)

    setOpenModal(false)
  }

  const handleAddCode = (
    code: string,
  ) => {
    const currentCodes = codes
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean)

    if (currentCodes.includes(code))
      return

    setCodes(
      [...currentCodes, code].join(
        "\n",
      ),
    )
  }

  const handleUsePresetCodes = () => {
    setCodes(PRESET_CODES.join("\n"))
  }

  const handleClearCodes = () => {
    setCodes("")
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  const handleSubmit = async () => {
    if (!roleId.trim()) {
      alert(
        "Vui lòng nhập ID nhân vật",
      )
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
      alert(
        "Vui lòng nhập giftcode",
      )
      return
    }

    setLoading(true)

    setLogs([])

    for (const code of codeList) {
      try {
        const payload = {
          _targetServerId:
            Number(roleId),
          serverId: "101",
          gameCode: "A49",
          roleId,
          roleName: roleId,
          code,
        }

        const response =
          await axios.post(
            API_URL,
            payload,
          )

        let rawMessage =
          response.data?.message ||
          response.data?.msg ||
          response.data?.data
            ?.message ||
          "Success"

        let message = rawMessage

        Object.entries(
          translations,
        ).forEach(([en, vi]) => {
          if (
            message.includes(en)
          ) {
            message = vi
          }
        })

        const success =
          rawMessage.includes(
            "Success",
          ) ||
          message ===
            "Nhập code thành công!"

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
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.msg ||
          error?.message ||
          "Lỗi kết nối"

        Object.entries(
          translations,
        ).forEach(([en, vi]) => {
          if (
            message.includes(en)
          ) {
            message = vi
          }
        })

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
            Tool nhập giftcode
            Crossfire Legends
          </Text>
        </Box>

        <ThemeToggle />
      </Flex>

      <VStack
        gap="5"
        align="stretch"
      >
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
              setRoleId(
                e.target.value,
              )
            }
          />
        </Box>

        <Box>
          <Flex
            justify="space-between"
            align="center"
            mb="2"
            gap="3"
            flexWrap="wrap"
          >
            <Text fontWeight="600">
              Danh sách Giftcode
            </Text>

            <HStack flexWrap="wrap">
              <Button
                size="sm"
                colorPalette="blue"
                variant="outline"
                onClick={
                  handleUsePresetCodes
                }
              >
                <LuPlus />
                Dùng Code Mẫu
              </Button>

              <Button
                size="sm"
                variant="outline"
                colorPalette="red"
                onClick={
                  handleClearCodes
                }
              >
                Xóa toàn bộ code
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setShowAllCodes(
                    !showAllCodes,
                  )
                }
              >
                {showAllCodes ? (
                  <>
                    <LuChevronUp />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <LuChevronDown />
                    Xem thêm
                  </>
                )}
              </Button>
            </HStack>
          </Flex>

          <Textarea
            placeholder="Mỗi dòng 1 giftcode"
            minH="220px"
            resize="vertical"
            value={codes}
            onChange={(e) =>
              setCodes(
                e.target.value,
              )
            }
          />

          <Box
            mt={showAllCodes ? "3" : "0"}
            maxH={
              showAllCodes
                ? "500px"
                : "0px"
            }
            opacity={
              showAllCodes ? 1 : 0
            }
            overflow="hidden"
            transition="all 0.35s ease"
          >
            <Box
              p="3"
              borderWidth="1px"
              rounded="lg"
            >
              <Flex
                wrap="wrap"
                gap="2"
              >
                {PRESET_CODES.map(
                  (item) => {
                    const isSelected =
                      selectedCodes.includes(
                        item,
                      )

                    return (
                      <Button
                        key={item}
                        size="xs"
                        variant={
                          isSelected
                            ? "solid"
                            : "subtle"
                        }
                        colorPalette={
                          isSelected
                            ? "blue"
                            : undefined
                        }
                        borderWidth="2px"
                        borderColor={
                          isSelected
                            ? "blue.500"
                            : "transparent"
                        }
                        onClick={() =>
                          handleAddCode(
                            item,
                          )
                        }
                      >
                        {item}
                      </Button>
                    )
                  },
                )}
              </Flex>
            </Box>
          </Box>
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
          maxH="450px"
          overflowY="auto"
        >
          <Flex
            justify="space-between"
            align="center"
            mb="4"
            flexWrap="wrap"
            gap="3"
          >
            <VStack
              align="start"
              gap="1"
            >
              <Text fontWeight="700">
                Nhật ký
              </Text>

              <HStack wrap="wrap">
                <Badge
                  colorPalette="blue"
                  px="2"
                  py="1"
                  rounded="md"
                >
                  Tổng: {totalCodes}
                </Badge>

                <Badge
                  colorPalette="green"
                  px="2"
                  py="1"
                  rounded="md"
                >
                  Thành công:{" "}
                  {successCount}
                </Badge>

                <Badge
                  colorPalette="red"
                  px="2"
                  py="1"
                  rounded="md"
                >
                  Thất bại: {failCount}
                </Badge>
              </HStack>
            </VStack>

            <Button
              size="sm"
              variant="outline"
              colorPalette="red"
              onClick={
                handleClearLogs
              }
            >
              Xóa nhật ký
            </Button>
          </Flex>

          <VStack align="stretch">
            {logs.length === 0 && (
              <Text opacity={0.6}>
                Chưa có dữ liệu
              </Text>
            )}

            {logs.map(
              (log, index) => (
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
              ),
            )}
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
                        e.target
                          .value,
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
