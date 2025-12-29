import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../store/useUserStore';
import { styles } from './styles/ProfileScreen.styles';

const PAGE_SIZE = 10;

interface Question {
  id: string;
  title: string;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  question_id: string;
  questions: {
    title: string;
  };
}

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'questions' | 'comments'>('questions');
  const [user, setUser] = useState<any>(null);
  
  // 전역 스토어 상태
  const { profile, isLoadingProfile, fetchProfile, updateNickname: updateStoreNickname } = useUserStore();
  
  // 데이터 상태
  const [questions, setQuestions] = useState<Question[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // 메타 정보
  const [counts, setCounts] = useState({ questions: 0, comments: 0 });
  
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState({ questions: 0, comments: 0 });
  const [hasMore, setHasMore] = useState({ questions: true, comments: true });

  // 닉네임 수정 상태
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. 초기 사용자 정보 로드 (프로필은 전역 스토어에서 관리)
  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // 프로필이 없으면 가져오기
        if (!profile) {
          fetchProfile(user.id);
        }

        // 전체 카운트 조회
        const [qCount, cCount] = await Promise.all([
          supabase.from('questions').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
          supabase.from('comments').select('*', { count: 'exact', head: true }).eq('author_id', user.id)
        ]);
        
        setCounts({
          questions: qCount.count || 0,
          comments: cCount.count || 0
        });

        // 첫 질문 목록 로드
        fetchList('questions', 0, user.id);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  // 2. 목록 로드 함수 (질문/답변 공용)
  const fetchList = async (type: 'questions' | 'comments', pageNum: number, userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query;
      if (type === 'questions') {
        query = supabase
          .from('questions')
          .select('id, title, created_at')
          .eq('author_id', targetUserId)
          .order('created_at', { ascending: false })
          .range(from, to);
      } else {
        query = supabase
          .from('comments')
          .select('id, content, created_at, question_id, questions(title)')
          .eq('author_id', targetUserId)
          .order('created_at', { ascending: false })
          .range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        if (type === 'questions') {
          const newQuestions = data as unknown as Question[];
          setQuestions(prev => pageNum === 0 ? newQuestions : [...prev, ...newQuestions]);
          setHasMore(h => ({ ...h, questions: data.length === PAGE_SIZE }));
        } else {
          const newComments = data as unknown as Comment[];
          setComments(prev => pageNum === 0 ? newComments : [...prev, ...newComments]);
          setHasMore(h => ({ ...h, comments: data.length === PAGE_SIZE }));
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 3. 닉네임 업데이트 함수
  const updateNickname = async () => {
    if (!newNickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    if (newNickname.trim().length > 10) {
      Alert.alert('알림', '닉네임은 최대 10자까지만 가능합니다.');
      return;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: newNickname.trim() })
        .eq('id', user.id);

      if (error) throw error;

      updateStoreNickname(newNickname.trim());
      setIsEditingNickname(false);
      Alert.alert('성공', '닉네임이 변경되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', '닉네임 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 4. 이미지 선택 및 업로드 함수
  const pickImage = async () => {
    try {
      // 갤러리 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 오류', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, // 🆕 용량 문제 해결을 위해 압축률 강화 (0.5 -> 0.3)
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      // [핵심] React Native에서 가장 안정적인 FormData 방식 도입
      // Supabase Storage JS 라이브러리는 RN 환경에서 FormData를 지원합니다.
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: contentType,
      } as any);

      // Supabase Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType
        });

      if (uploadError) {
        console.error('Supabase Upload Error:', uploadError);
        if (uploadError.message.includes('exceeded the maximum allowed size')) {
          Alert.alert('용량 초과', '이미지 파일이 너무 큽니다. Supabase 스토리지 설정에서 제한을 늘리거나 더 작은 사진을 선택해주세요.');
        } else {
          throw uploadError;
        }
        return;
      }

      // Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // profiles 테이블 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 전역 스토어 업데이트
      if (profile) {
        useUserStore.getState().setProfile({ ...profile, avatar_url: publicUrl });
      }
      
      Alert.alert('성공', '프로필 사진이 변경되었습니다.');
    } catch (error: any) {
      console.error('Upload error details:', error);
      Alert.alert('오류', '사진 업로드에 실패했습니다. (네트워크 상태를 확인해주세요)');
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = () => {
    setNewNickname(profile?.nickname || '');
    setIsEditingNickname(true);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 탭 변경 시 데이터가 없으면 로드
  useEffect(() => {
    if (user && activeTab === 'comments' && comments.length === 0 && hasMore.comments) {
      fetchList('comments', 0);
    }
  }, [activeTab]);

  const loadMore = () => {
    if (loadingMore || !hasMore[activeTab]) return;
    const nextPage = page[activeTab] + 1;
    setPage(p => ({ ...p, [activeTab]: nextPage }));
    fetchList(activeTab, nextPage);
  };

  const renderQuestionItem = ({ item }: { item: Question }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
    >
      <View style={styles.itemHeader}>
        <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      </View>
      <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => navigation.navigate('QuestionDetail', { questionId: item.question_id })}
    >
      <View style={styles.itemHeader}>
        <Ionicons name="chatbubble-outline" size={18} color="#666" />
        <Text style={styles.commentContent} numberOfLines={2}>{item.content}</Text>
      </View>
      <View style={styles.commentFooter}>
        <Text style={styles.originQuestion} numberOfLines={1}>📍 {item.questions?.title || '삭제된 질문'}</Text>
        <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const memoizedHeader = useMemo(() => (
    <View style={styles.headerComponent}>
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={pickImage}
            disabled={isUpdating}
          >
            {profile?.avatar_url ? (
              <Image 
                source={{ uri: profile.avatar_url }} 
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <Image 
                source={require('../../assets/default_profile.png')} 
                style={styles.avatar}
                resizeMode="cover"
              />
            )}
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
        
        {isEditingNickname ? (
          <View style={styles.editNicknameContainer}>
            <TextInput
              style={styles.nicknameInput}
              value={newNickname}
              onChangeText={setNewNickname}
              autoFocus
              maxLength={10}
              placeholder="닉네임 입력"
            />
            <View style={styles.editButtons}>
              <TouchableOpacity onPress={() => setIsEditingNickname(false)} disabled={isUpdating}>
                <Ionicons name="close-circle" size={28} color="#FF4D4D" />
              </TouchableOpacity>
              <TouchableOpacity onPress={updateNickname} disabled={isUpdating}>
                {isUpdating ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Ionicons name="checkmark-circle" size={28} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.nicknameRow}>
            <Text style={styles.nickname}>{profile?.nickname || '닉네임 없음'}</Text>
            <TouchableOpacity onPress={startEditing} style={styles.editIcon}>
              <Ionicons name="pencil-outline" size={18} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.providerBadge}>
          <Text style={styles.providerText}>
            {user?.app_metadata?.provider === 'kakao' ? '카카오' : '구글'}로 이용 중
          </Text>
        </View>
        
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{counts.questions}</Text>
            <Text style={styles.statLabel}>작성한 질문</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{counts.comments}</Text>
            <Text style={styles.statLabel}>작성한 답변</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'questions' && styles.activeTab]}
          onPress={() => setActiveTab('questions')}
        >
          <Text style={[styles.tabText, activeTab === 'questions' && styles.activeTabText]}>질문</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'comments' && styles.activeTab]}
          onPress={() => setActiveTab('comments')}
        >
          <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>답변</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [profile, isEditingNickname, newNickname, counts, isUpdating, activeTab, user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeftButton}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>마이페이지</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings')} 
          style={styles.headerRightButton}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'questions' ? (questions as any[]) : (comments as any[])}
        renderItem={activeTab === 'questions' ? renderQuestionItem as any : renderCommentItem as any}
        keyExtractor={item => item.id}
        ListHeaderComponent={memoizedHeader}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'questions' ? '아직 작성한 질문이 없습니다.' : '아직 작성한 답변이 없습니다.'}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.footerLoader} />
          ) : null
        }
      />

      {loading && page[activeTab] === 0 || isLoadingProfile && !profile ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

