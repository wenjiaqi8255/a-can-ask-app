import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 预设的感受选项
const FEELINGS = [
  '饥饿', '头晕', '疲倦', '焦虑', '胃痛', '心慌', '呼吸急促', '手脚冰凉'
];

// 感受记录的接口定义
interface FeelingRecord {
  id: string;
  feeling: string;
  timestamp: number;
}

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [records, setRecords] = useState<FeelingRecord[]>([]);

  // 加载已保存的感受记录
  useEffect(() => {
    loadRecords();
  }, []);

  // 从AsyncStorage加载记录
  const loadRecords = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('feeling_records');
      if (jsonValue !== null) {
        const allRecords = JSON.parse(jsonValue) as FeelingRecord[];
        // 只显示今天的记录
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayRecords = allRecords.filter(record => {
          const recordDate = new Date(record.timestamp);
          return recordDate.getTime() >= today.getTime();
        });
        
        setRecords(todayRecords);
      }
    } catch (error) {
      console.log('加载记录失败:', error);
    }
  };

  // 保存感受记录
  const saveFeeling = async (feeling: string) => {
    try {
      const newRecord: FeelingRecord = {
        id: Date.now().toString(),
        feeling,
        timestamp: Date.now(),
      };

      // 先获取所有记录
      const jsonValue = await AsyncStorage.getItem('feeling_records');
      let allRecords: FeelingRecord[] = [];
      
      if (jsonValue !== null) {
        allRecords = JSON.parse(jsonValue);
      }
      
      // 添加新记录
      allRecords.push(newRecord);
      
      // 保存回AsyncStorage
      await AsyncStorage.setItem('feeling_records', JSON.stringify(allRecords));
      
      // 更新状态
      setRecords(prev => [...prev, newRecord]);
      
      // 关闭模态框
      setModalVisible(false);
    } catch (error) {
      console.log('保存感受失败:', error);
    }
  };

  // 格式化时间显示
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>ACanAnswer</Text>
        <Text style={styles.subtitle}>感受记录助手</Text>
      </View>
      
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.recordButtonText}>记录感受</Text>
      </TouchableOpacity>
      
      <View style={styles.recordListContainer}>
        <Text style={styles.recordListTitle}>今日记录</Text>
        
        <ScrollView style={styles.recordList}>
          {records.length > 0 ? (
            records
              .sort((a, b) => b.timestamp - a.timestamp) // 按时间倒序排列
              .map(record => (
                <View key={record.id} style={styles.record}>
                  <Text style={styles.recordTime}>{formatTime(record.timestamp)}</Text>
                  <Text style={styles.recordFeeling}>{record.feeling}</Text>
                </View>
              ))
          ) : (
            <Text style={styles.emptyText}>今天还没有记录哦</Text>
          )}
        </ScrollView>
      </View>
      
      {/* 感受选择模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择你现在的感受</Text>
            
            <View style={styles.feelingButtonsContainer}>
              {FEELINGS.map(feeling => (
                <TouchableOpacity
                  key={feeling}
                  style={styles.feelingButton}
                  onPress={() => saveFeeling(feeling)}
                >
                  <Text style={styles.feelingButtonText}>{feeling}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  recordButton: {
    backgroundColor: '#4285F4',
    borderRadius: 50,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  recordListContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  recordListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  recordList: {
    flex: 1,
  },
  record: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  recordTime: {
    fontSize: 16,
    color: '#666',
    marginRight: 15,
    fontWeight: '500',
  },
  recordFeeling: {
    fontSize: 18,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  feelingButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  feelingButton: {
    backgroundColor: '#E8F0FE',
    padding: 15,
    margin: 8,
    borderRadius: 50,
    minWidth: 100,
    alignItems: 'center',
  },
  feelingButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
