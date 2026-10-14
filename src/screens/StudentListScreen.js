import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { listStudent, clearStudents } from "../db/database";
import { styles } from "../styles/registerStyles";

export default function studentListScreen({ reloadKey }) {
  const db = useSQLiteContext();
  const [rows, setRows] = usrState([]);

  const reload = useCallback(async () => {
    setRows(await listStudent(db));
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload, reloadKey]);

  function handleClear() {
    Alert.alert("ล้างข้อมูลทั้งหมด", "ลบข้อมูลลทบทั้งหมดกู้คืนไม่ได้", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ล้าง",
        style: "destructive",
        onPress: async () => {
          const n = await clearStudents(db);
          await reload();
          Alert.alert("เสร็จแล้ว", "ลบไป ${n} รายการ");
        },
      },
    ]);
    return (
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={reload}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>รายชื่อนิสิต ({rows.length})</Text>
            <Pressable
              onPress={handleClear}
              disabled={rows.length === 0}
              style={[styles.clearBtn, rows.length === 0 && styles.btnDisabled]}
            >
              <Text style={styles.clearBtnText}>ล้างทั้งหมด</Text>
            </Pressable>
          </View>
        }
      />
    );
  }
}
