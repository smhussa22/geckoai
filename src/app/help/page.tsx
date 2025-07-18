import Header from '../Header';
import Sidebar from '../Sidebar';
import Logo from '../Logo'
import SidebarItem from '../SidebarItem';
import { Settings } from 'lucide-react';
import { HelpingHand } from 'lucide-react';

// <Header title = "TailLink" sub_title = "Your semester, built seamlessly." />
export default function TailLink() {

  return (
    
    <>

      <div className = "flex h-screen">
        
        <Sidebar sidebar_user_icon = "" sidebar_user_name = "GeckoAI User" sidebar_user_email = "geckoai@geckoai.com"> 
          
          <SidebarItem button_text_color = {''} button_icon = {<Settings color= {''}  size={35} className='p-1 my-2'/>} button_route = './taillink' button_text = "TailLink" /> 
          <SidebarItem button_text_color = {''} button_icon = {<Settings color= {''}  size={35} className='p-1 my-2'/>} button_route = './quizscale' button_text = "QuizScale (WIP)" />

          <hr className='my-3 border-neutral-800'/> {/* line seperating tools & misc */}

          <SidebarItem button_text_color = {''} button_icon = {<Settings color= {''}  size={35} className='p-1 my-2'/>} button_route = './settings' button_text = "Settings" /> 
          <SidebarItem button_text_color = {''} button_icon = {<HelpingHand color= {''} size={35} className='p-1 my-2'/>} button_route = './help' button_text = "Help" /> 

        </Sidebar>
      
      </div>

    </>

  );

}
