


// import { View, Text, TextInput, Pressable, Image, Dimensions, StyleSheet, SectionList, ScrollView } from 'react-native'
// import React, { useState, useCallback, memo, useRef } from 'react'
// import { StatusBar } from 'expo-status-bar'
// import { FlashList } from '@shopify/flash-list'
// import Animated, { FadeIn } from 'react-native-reanimated'
// import { Ionicons, Feather } from '@expo/vector-icons'

// const { width, height } = Dimensions.get('window')

// // Story Item Component
// const StoryItem = memo(({ item, index }) => {
//     if (item.type === 'search') {
//         return (
//             <Pressable style={[styles.storyItemContainer, index === 0 && styles.firstStoryMargin]}>
//                 <View style={styles.searchCircle}>
//                     <Feather name="search" size={24} color="#666" />
//                 </View>
//                 <Text style={styles.storyTitle}>Search</Text>
//             </Pressable>
//         )
//     }

//     return (
//         <Pressable style={[styles.storyItemContainer, index === 0 && styles.firstStoryMargin]}>
//             <View style={styles.storyCircle}>
//                 <Image
//                     source={{ uri: item.image }}
//                     style={styles.storyImage}
//                 />
//             </View>
//             <Text style={styles.storyTitle}>{item.title}</Text>
//         </Pressable>
//     )
// })

// // Grid Item Component
// const GridItem = memo(({ item, index, isLastItem, onViewAll }) => {
//     if (isLastItem) {
//         return (
//             <Pressable
//                 style={[styles.gridItem, styles.viewMoreItem]}
//                 onPress={onViewAll}
//             >
//                 <Image
//                     source={{ uri: item.image }}
//                     style={styles.gridImage}
//                 />
//                 <View style={styles.viewMoreOverlay}>
//                     <Text style={styles.viewMoreText}>ดูทั้งหมด</Text>
//                 </View>
//             </Pressable>
//         )
//     }

//     return (
//         <Pressable style={styles.gridItem}>
//             <Image
//                 source={{ uri: item.image }}
//                 style={styles.gridImage}
//             />
//             <View style={styles.likesContainer}>
//                 <Ionicons name="heart" size={12} color="white" />
//                 <Text style={styles.likesText}>{item.likes}</Text>
//             </View>
//         </Pressable>
//     )
// })

// const SearchScreen = () => {
//     const [searchQuery, setSearchQuery] = useState('')
//     const [activeSection, setActiveSection] = useState('For You')
//     const scrollViewRef = useRef(null)
//     const [sectionLayouts, setSectionLayouts] = useState({})

//     const HEADER_HEIGHT = 155


//     const stories = [
//         { id: 'search', title: 'Search', type: 'search' },
//         { id: '1', title: 'อาหาร', image: "https://cdn-icons-png.flaticon.com/512/5235/5235253.png" },
//         { id: '2', title: 'ท่องเที่ยว', image: "https://cdn-icons-png.flaticon.com/512/5235/5235253.png" },
//         { id: '3', title: 'แฟชั่น', image: "https://cdn-icons-png.flaticon.com/512/5235/5235253.png" },
//         { id: '4', title: 'กีฬา', image: "https://cdn-icons-png.flaticon.com/512/5235/5235253.png" },
//         { id: '5', title: 'ความงาม', image: "https://cdn-icons-png.flaticon.com/512/5235/5235253.png" },
//     ]

//     const sections = [
//         {
//             title: 'For You',
//             data: Array(9).fill(null).map((_, index) => ({
//                 id: `foryou_${index}`,
//                 image: `https://picsum.photos/500/500?random=${index}`,
//                 likes: Math.floor(Math.random() * 1000),
//             }))
//         },
//         {
//             title: 'Trending',
//             data: Array(9).fill(null).map((_, index) => ({
//                 id: `trending_${index}`,
//                 image: `https://picsum.photos/500/500?random=${index + 10}`,
//                 likes: Math.floor(Math.random() * 1000),
//             }))
//         },
//         {
//             title: 'Food',
//             data: Array(9).fill(null).map((_, index) => ({
//                 id: `food_${index}`,
//                 image: `https://picsum.photos/500/500?random=${index + 20}`,
//                 likes: Math.floor(Math.random() * 1000),
//             }))
//         },
//         {
//             title: 'Travel',
//             data: Array(9).fill(null).map((_, index) => ({
//                 id: `travel_${index}`,
//                 image: `https://picsum.photos/500/500?random=${index + 30}`,
//                 likes: Math.floor(Math.random() * 1000),
//             }))
//         },
//         {
//             title: 'Fashion',
//             data: Array(9).fill(null).map((_, index) => ({
//                 id: `fashion_${index}`,
//                 image: `https://picsum.photos/500/500?random=${index + 40}`,
//                 likes: Math.floor(Math.random() * 1000),
//             }))
//         }
//     ]

//     const tabs = sections.map(section => section.title)

//     const scrollToSection = useCallback((sectionTitle: string) => {
//         const sectionLayout = sectionLayouts[sectionTitle]
//         if (sectionLayout) {
//             scrollViewRef.current?.scrollTo({
//                 y: sectionLayout.y - HEADER_HEIGHT,
//                 animated: true
//             })
//         }
//     }, [sectionLayouts])

//     const handleScroll = useCallback((event) => {
//         const offsetY = event.nativeEvent.contentOffset.y

//         let currentSection = 'For You'
//         Object.entries(sectionLayouts).forEach(([title, layout]) => {
//             if (offsetY >= layout.y - HEADER_HEIGHT - 10) {
//                 currentSection = title
//             }
//         })

//         if (currentSection !== activeSection) {
//             setActiveSection(currentSection)
//         }
//     }, [sectionLayouts, activeSection])


//     const handleViewAll = useCallback((sectionTitle: string) => {
//         // TODO: Navigate to view all screen for this section
//         console.log(`View all items in ${sectionTitle}`)
//     }, [])

//     const renderSectionHeader = useCallback(({ section }) => (
//         <View
//             onLayout={(event) => {
//                 const layout = event.nativeEvent.layout
//                 setSectionLayouts(prev => ({
//                     ...prev,
//                     [section.title]: {
//                         y: layout.y,
//                         height: layout.height
//                     }
//                 }))
//             }}
//             style={styles.sectionHeader}
//         >
//             <Text style={styles.sectionTitle}>{section.title}</Text>
//             <Pressable
//                 onPress={() => handleViewAll(section.title)}
//                 style={styles.viewAllButton}
//             >
//                 <Text style={styles.viewAllText}>ดูทั้งหมด</Text>
//             </Pressable>
//         </View>
//     ), [handleViewAll])

//     const renderSectionContent = useCallback(({ section }) => {
//         const items = section.data
//         const rows = []

//         for (let i = 0; i < items.length; i += 3) {
//             const rowItems = items.slice(i, i + 3)
//             rows.push(
//                 <View key={i} style={styles.gridRow}>
//                     {rowItems.map((item, index) => (
//                         <GridItem
//                             key={item.id}
//                             item={item}
//                             index={index}
//                             isLastItem={i + index === items.length - 1}
//                             onViewAll={() => handleViewAll(section.title)}
//                         />
//                     ))}
//                 </View>
//             )
//         }

//         return <View style={styles.gridContainer}>{rows}</View>
//     }, [handleViewAll])

//     return (
//         <View style={styles.container}>
//             <StatusBar style="dark" />
//             <View style={styles.searchHeader}>
//                 <Pressable style={styles.searchBar}>
//                     <Ionicons name="search" size={20} color="#666" />
//                     <TextInput
//                         placeholder="ค้นหา"
//                         placeholderTextColor="#666"
//                         style={styles.searchInput}
//                     />
//                 </Pressable>
//             </View>

//             <ScrollView
//                 ref={scrollViewRef}
//                 stickyHeaderIndices={[1]}
//                 onScroll={handleScroll}
//                 scrollEventThrottle={16}
//                 showsVerticalScrollIndicator={false}
//             >
//                 <View style={styles.storiesContainer}>
//                     <FlashList
//                         data={stories}
//                         renderItem={({ item, index }) => (
//                             <StoryItem item={item} index={index} />
//                         )}
//                         estimatedItemSize={75}
//                         horizontal
//                         showsHorizontalScrollIndicator={false}
//                     />
//                 </View>

//                 {/* Sticky Tabs */}
//                 <View style={styles.stickyTabsWrapper}>
//                     <ScrollView
//                         horizontal
//                         showsHorizontalScrollIndicator={false}
//                         style={styles.stickyTabsContainer}
//                     >
//                         {tabs.map((tabTitle) => (
//                             <Pressable
//                                 key={tabTitle}
//                                 style={[
//                                     styles.tabItem,
//                                     tabTitle === activeSection && styles.activeTabItem
//                                 ]}
//                                 onPress={() => {
//                                     setActiveSection(tabTitle)
//                                     scrollToSection(tabTitle)
//                                 }}
//                             >
//                                 <Text style={[
//                                     styles.tabText,
//                                     tabTitle === activeSection && styles.activeTabText
//                                 ]}>
//                                     {tabTitle}
//                                 </Text>
//                             </Pressable>
//                         ))}
//                     </ScrollView>
//                 </View>

//                 <SectionList
//                     sections={sections}
//                     renderItem={() => null}
//                     renderSectionHeader={renderSectionHeader}
//                     renderSectionFooter={renderSectionContent}
//                     stickySectionHeadersEnabled={false}
//                     scrollEnabled={false}
//                 />
//             </ScrollView>
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: 'white'
//     },
//     stickyTabsWrapper: {
//         backgroundColor: 'white',
//         zIndex: 1000,
//         borderBottomWidth: 0.5,
//         borderBottomColor: '#dbdbdb',
//     },
//     stickyTabsContainer: {
//         height: 45,
//     },
//     activeTabIndicator: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         height: 2,
//         backgroundColor: '#000',
//     },
//     searchHeader: {
//         paddingTop: 50,
//         paddingHorizontal: 15,
//         paddingBottom: 10,
//         borderBottomWidth: 0.5,
//         borderBottomColor: '#dbdbdb',
//         backgroundColor: 'white',
//         zIndex: 1000,
//     },
//     searchBar: {
//         flexDirection: 'row',
//         backgroundColor: '#efefef',
//         padding: 8,
//         borderRadius: 10,
//         alignItems: 'center'
//     },
//     searchInput: {
//         flex: 1,
//         marginLeft: 8,
//         fontSize: 16
//     },
//     storiesContainer: {
//         height: 100,
//         borderBottomWidth: 0.5,
//         borderBottomColor: '#dbdbdb'
//     },
//     storyItemContainer: {
//         width: 75,
//         marginRight: 8,
//         alignItems: 'center'
//     },
//     firstStoryMargin: {
//         marginLeft: 15
//     },
//     searchCircle: {
//         width: 65,
//         height: 65,
//         borderRadius: 32.5,
//         backgroundColor: '#f0f0f0',
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     storyCircle: {
//         padding: 3,
//         borderRadius: 32.5,
//         borderWidth: 2,
//         borderColor: '#FF3366'
//     },
//     storyImage: {
//         width: 60,
//         height: 60,
//         borderRadius: 30
//     },
//     storyTitle: {
//         marginTop: 4,
//         fontSize: 12,
//         textAlign: 'center'
//     },
//     sectionListContent: {
//         paddingBottom: 16
//     },
//     sectionHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: 16,
//         backgroundColor: 'white',
//         borderBottomWidth: 0.5,
//         borderBottomColor: '#dbdbdb',
//     },
//     activeSectionHeader: {
//         backgroundColor: '#f8f8f8',
//     },
//     sectionTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     viewAllButton: {
//         padding: 8,
//     },
//     viewAllText: {
//         color: '#0095f6',
//         fontSize: 14,
//         fontWeight: '500',
//     },
//     gridContainer: {
//         paddingHorizontal: 0.5,
//         backgroundColor: 'white',
//     },
//     gridRow: {
//         flexDirection: 'row',
//         justifyContent: 'flex-start',
//     },
//     gridItem: {
//         width: (width - 3) / 3,
//         height: (width - 3) / 3,
//         marginRight: 1,
//         marginBottom: 1,
//     },
//     gridImage: {
//         width: '100%',
//         height: '100%',
//     },
//     viewMoreItem: {
//         position: 'relative',
//     },
//     viewMoreOverlay: {
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     viewMoreText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     likesContainer: {
//         position: 'absolute',
//         bottom: 5,
//         left: 5,
//         flexDirection: 'row',
//         alignItems: 'center'
//     },
//     likesText: {
//         color: 'white',
//         fontSize: 12,
//         marginLeft: 3,
//         fontWeight: '600'
//     },
//     stickyTabsContainer: {
//         backgroundColor: 'white',
//         borderBottomWidth: 0.5,
//         borderBottomColor: '#dbdbdb',
//         height: 45,
//         zIndex: 1000,
//     },
//     tabItem: {
//         paddingHorizontal: 16,
//         height: '100%',
//         justifyContent: 'center',
//         alignItems: 'center',
//         position: 'relative',
//         minWidth: 80,
//     },
//     activeTabItem: {
//         borderBottomWidth: 2,
//         borderBottomColor: '#000',
//     },
//     tabText: {
//         fontSize: 14,
//         color: '#666',
//         fontWeight: '500',
//     },
//     activeTabText: {
//         color: '#000',
//         fontWeight: '600',
//     },
// })

// export default SearchScreen