import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from 'react-native';
import { Edit3, Trash2, X } from 'lucide-react-native';

interface ActionSheetOption {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  color?: string;
  destructive?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
}

export default function ActionSheet({ visible, onClose, title, options }: Props) {
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity }
            ]}
          />
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                { transform: [{ translateY }] }
              ]}
            >
              <View style={styles.handle} />
              
              {title && (
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      option.destructive && styles.destructiveOption
                    ]}
                    onPress={() => {
                      option.onPress();
                      onClose();
                    }}
                  >
                    <View style={styles.optionIcon}>
                      {option.icon}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        option.destructive && styles.destructiveText,
                        option.color && { color: option.color }
                      ]}
                    >
                      {option.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area bottom
    minHeight: 200,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    paddingTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  destructiveOption: {
    backgroundColor: '#fef2f2',
  },
  optionIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  destructiveText: {
    color: '#dc2626',
  },
});
