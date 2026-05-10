import { useState } from "react"
import axios from "axios"

import {
  Box,
  Button,
  Clipboard,
  ClientOnly,
  Container,
  Flex,
  Heading,
  IconButton,
  Input,
  Skeleton,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"

import { useColorMode } from "@/components/ui/color-mode"

import { LuMoon, LuSun } from "react-icons/lu"

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

        const response = await axios.post(API_URL, payload)

        let rawMessage =
          response.data?.message ||
          response.data?.msg ||
          response.data?.data?.message ||
          "Success"

        let message = rawMessage

        Object.entries(translations).forEach(([en, vi]) => {
          if (message.includes(en)) {
            message = vi
          }
        })

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

        Object.entries(translations).forEach(([en, vi]) => {
          if (message.includes(en)) {
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
      <Flex justify="space-between" align="center" mb="8">
        <Box>
          <Heading size="lg">Auto Nhập Code CFL</Heading>

          <Text mt="1" opacity={0.7}>
            Tool nhập giftcode Crossfire Legends
          </Text>
        </Box>

        <ThemeToggle />
      </Flex>

      <VStack gap="5" align="stretch">
        <Box>
          <Text mb="2" fontWeight="600">
            ID Nhân vật
          </Text>

          <Input
            placeholder="Nhập ID nhân vật"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          />
        </Box>

        <Box>
          <Flex justify="space-between" align="center" mb="2">
            <Text fontWeight="600">Danh sách Giftcode</Text>

            <Clipboard.Root value={codes}>
              <Clipboard.Trigger asChild>
                <Button size="sm" variant="outline">
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
            onChange={(e) => setCodes(e.target.value)}
          />
        </Box>

        <Button
          colorPalette="blue"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? "Đang nhập code..." : "Bắt đầu nhập"}
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
              <Text opacity={0.6}>Chưa có dữ liệu</Text>
            )}

            {logs.map((log, index) => (
              <Box
                key={index}
                p="3"
                rounded="lg"
                borderWidth="1px"
                borderColor={log.success ? "green.500" : "red.500"}
              >
                <Text fontWeight="700">{log.code}</Text>

                <Text
                  mt="1"
                  color={log.success ? "green.500" : "red.500"}
                >
                  {log.message}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}
