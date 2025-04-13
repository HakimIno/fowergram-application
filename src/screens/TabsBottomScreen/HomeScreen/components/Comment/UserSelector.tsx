import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export interface User {
  id: string;
  username: string;
  avatar: string;
  displayName?: string;
}

interface UserSelectorProps {
  users: User[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  colors: any;
}

const UserSelector: React.FC<UserSelectorProps> = ({ 
  users, 
  selectedUserId, 
  onSelectUser,
  colors
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.tertiary }]}>
        ทำ comment เป็น:
      </Text>
      <View style={styles.usersContainer}>
        {users.map(user => (
          <TouchableOpacity
            key={user.id}
            style={[
              styles.userButton,
              selectedUserId === user.id && { 
                borderColor: colors.primary,
                backgroundColor: colors.background.tertiary 
              }
            ]}
            onPress={() => onSelectUser(user.id)}
          >
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar} 
            />
            <Text 
              style={[
                styles.username,
                { color: colors.text.primary },
                selectedUserId === user.id && { color: colors.primary }
              ]}
            >
              {user.displayName || user.username}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  title: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Chirp_Regular',
  },
  usersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    gap: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  username: {
    fontSize: 12,
    fontFamily: 'Chirp_Bold',
  }
});

export default UserSelector; 