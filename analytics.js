// Inviteation by Ghada — unified analytics for Yousef Animal Discovery
(function(){
  "use strict";
  const SUPABASE_URL="https://jzswtwicvgppisasrkqe.supabase.co";
  const SUPABASE_KEY="sb_publishable_qJGOZoWBOrZ952qJnYTqNg_oaMSIStu";
  const HEADERS={
    apikey:SUPABASE_KEY,
    Authorization:"Bearer "+SUPABASE_KEY,
    "Content-Type":"application/json"
  };
  const state={project:null};

  function uuid(){
    if(crypto && typeof crypto.randomUUID==="function") return crypto.randomUUID();
    return "v-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
  }
  function visitorKey(){
    const k="ghada_analytics_visitor";
    let v=localStorage.getItem(k);
    if(!v){v=uuid();localStorage.setItem(k,v)}
    return v;
  }
  function sessionKey(){
    const k="ghada_analytics_session";
    let v=sessionStorage.getItem(k);
    if(!v){v=uuid();sessionStorage.setItem(k,v)}
    return v;
  }
  function guestKey(){
    return new URLSearchParams(location.search).get("guest")||null;
  }
  async function lookup(slug){
    const url=SUPABASE_URL+"/rest/v1/analytics_projects?slug=eq."+encodeURIComponent(slug)+"&is_active=eq.true&select=id,slug,project_type&limit=1";
    const r=await fetch(url,{headers:HEADERS});
    if(!r.ok) throw new Error("project_lookup_failed");
    const rows=await r.json();
    if(!rows.length) throw new Error("project_not_found");
    return rows[0];
  }
  async function track(eventName,opts={}){
    if(!state.project) return;
    try{
      const r=await fetch(SUPABASE_URL+"/rest/v1/analytics_events",{
        method:"POST",
        headers:{...HEADERS,Prefer:"return=minimal"},
        keepalive:true,
        body:JSON.stringify({
          project_id:state.project.id,
          visitor_key:visitorKey(),
          session_key:sessionKey(),
          guest_key:guestKey(),
          event_name:eventName,
          page_key:opts.pageKey||null,
          metadata:{
            ...(opts.metadata||{}),
            path:location.pathname,
            referrer:document.referrer||null
          }
        })
      });
      if(!r.ok) throw new Error("event_insert_failed");
    }catch(e){console.warn("[GhadaAnalytics]",e.message)}
  }
  async function init(opts){
    try{
      state.project=await lookup(opts.projectSlug);
      await track("view",{
        pageKey:opts.pageKey||"main",
        metadata:{device_width:innerWidth,device_height:innerHeight}
      });
      document.addEventListener("click",e=>{
        const el=e.target.closest("[data-analytics]");
        if(!el)return;
        const metadata={};
        if(el.dataset.platform)metadata.platform=el.dataset.platform;
        if(el.dataset.button)metadata.button=el.dataset.button;
        track(el.dataset.analytics,{pageKey:el.dataset.page||"main",metadata});
      },true);
    }catch(e){console.warn("[GhadaAnalytics]",e.message)}
  }
  async function likeRequest(functionName){
    const r=await fetch(SUPABASE_URL+"/rest/v1/rpc/"+functionName,{
      method:"POST",headers:HEADERS,
      body:JSON.stringify({p_slug:"yousef-animal-discovery",p_visitor_key:visitorKey()})
    });
    if(!r.ok)throw new Error("likes_unavailable");
    return r.json();
  }
  async function likeStats(){
    const rows=await likeRequest("get_invitation_stats");
    if(!rows.length)throw new Error("likes_project_not_found");
    return rows[0];
  }
  async function toggleLike(){return likeRequest("toggle_invitation_like")}
  window.GhadaAnalytics={init,track,likeStats,toggleLike};
})();
