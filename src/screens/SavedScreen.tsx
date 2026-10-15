import React from 'react';
import { Alert, Image, ImageBackground, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = any;
type Tab = 'Home' | 'Search' | 'Listings' | 'Saved' | 'Account';
type Role = 'Customer' | 'Dealer';
type ListingStatus = 'Published' | 'Pending Review' | 'Draft' | 'Reserved' | 'Sold' | 'Paused';

export default function SavedScreen(p: Props) {
 const {s,C,HERO,money,Glass,Button,Header,Section,Field,Chip,Action,Empty,DataRow,Stat,Plan,Spec,Setting,LeadSection,insets,width,screen,setScreen,role,setRole,authMode,setAuthMode,name,setName,email,setEmail,phone,setPhone,password,setPassword,dealerName,setDealerName,user,setUser,tab,setTab,saved,setSaved,compare,setCompare,cars,setCars,selected,setSelected,query,setQuery,category,setCategory,filterOpen,setFilterOpen,filters,setFilters,enquiries,setEnquiries,expenses,setExpenses,sales,setSales,modal,setModal,form,setForm,photoUris,setPhotoUris,leadMessage,setLeadMessage,loading,setLoading,toast,setToast,dealerSection,setDealerSection,menuOpen,setMenuOpen,shown,mine,toggleSaved,closeModal,isIOSPrompt,authenticate,socialLogin,openSell,pickPhotos,submitListing,contact,changeStatus,notify,CarTile,BottomBar,CarDetail,ListingRow,ActionModal,api,Platform,ImagePicker,AsyncStorage} = p;
 return (<ScrollView contentContainerStyle={{paddingBottom:120}}><View style={s.pad}><Header title="Saved cars" subtitle={saved.length+' cars saved for later'}/>{saved.length?<View style={s.grid}>{cars.filter(c=>saved.includes(c.id)).map(car=><CarTile key={car.id} car={car} compact/>)}</View>:<Empty title="Your shortlist starts here" sub="Tap the heart on a car to save it for later." icon="heart-outline" cta="Explore cars" onPress={()=>setTab('Search')}/>}<Section title={'Compare cars ('+compare.length+'/3)'}/>{compare.length>=2?<Button title="Compare selected vehicles" icon="git-compare-outline" onPress={()=>Alert.alert('Compare cars',cars.filter(c=>compare.includes(c.id)).map(c=>c.title+' · '+money(c.price)+' · '+c.year+' · '+c.km.toLocaleString('en-IN')+' km').join('\n\n'))}/>:<Text style={s.muted}>Open a car and add it to comparison. Compare up to three cars.</Text>}{cars.filter(c=>compare.includes(c.id)).map(c=><DataRow key={c.id} title={c.title} detail={c.year+' · '+c.km.toLocaleString('en-IN')+' km · '+c.fuel} value={money(c.price)}/>)}</View></ScrollView>);
}
