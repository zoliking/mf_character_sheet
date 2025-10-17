on ("change:repeating_advantages:advantage_cost change:repeating_resources:resource_cost change:repeating_backgrounds:background_cost", changeRepeatingXP);

async function changeRepeatingXP(info)
    {
    var ids;
    var total = 0;
    
    var property = info.sourceAttribute.split("_")[1];
    
    console.log(property);
    
    var attribA = "repeating_advantages_";
    var attribB = "_advantage_cost";
    
    switch(property)
        {
        case "resources":
            attribA = "repeating_resources_";
            attribB = "_resource_cost";
        break;
        
        case "backgrounds":
            attribA = "repeating_backgrounds_";
            attribB = "_background_cost";
        break;
        }
        
    ids = await getSectionIDsAsync(attribA.substring(0, attribA.length - 1));
    
    console.log(attribA + "??" + attribB + ": " + ids.length);
    
    for (var i=0; i<ids.length; i++)
        {
        var values = await getAttrsAsync([attribA + ids[i] + attribB]);
        
        console.log(values);
        
        var cost = Number(values[attribA + ids[i] + attribB]);
        if (cost != NaN)
            {
            total += cost;
            }
        }
        
    switch (property)
        {
        case "advantages":
            await setAttrsAsync({"advantage_xp": total});
        break;
        case "resources":
            await setAttrsAsync({"resource_xp": total});
        break;
        case "backgrounds":
            await setAttrsAsync({"background_xp": total});
        break;
        }
    }

on ("change:equipped_armor_hp change:equipped_armor_bonus_hp", changeEquippedHP);

async function changeEquippedHP(info)
    {
    if (info.sourceType == "player")
        {
        var values = await getAttrsAsync(["equipped_armor_id"]);
        //console.log(values);
        if (values.equipped_armor_id != "0")
            {
            if (info.sourceAttribute.includes("bonus"))
                {
                await setAttrsAsync({["repeating_armor_" + values.equipped_armor_id + "_armor_bonus_hp"]: info.newValue});
                }
                else
                {
                await setAttrsAsync({["repeating_armor_" + values.equipped_armor_id + "_armor_hp"]: info.newValue});
                }
            }
        }
    }

on ("change:repeating_armor:armor_max_hp change:repeating_armor:armor_max_bonus_hp", changeArmorHP);

async function changeArmorHP(info)
    {
    console.log(JSON.stringify(info));
    if (info.sourceType == "player")
        {
        var id = info.triggerName.split("_")[2];
        console.log(id);
        if (info.previousValue == "" |
            !info.hasOwnProperty("previousValue"))
            {
            if (info.triggerName.includes("bonus"))
                {
                await setAttrsAsync({["repeating_armor_" + id + "_armor_bonus_hp"]: info.newValue});
                }
                else
                {
                await setAttrsAsync({["repeating_armor_" + id + "_armor_hp"]: info.newValue});
                }
                
            var value = await getAttrsAsync(["repeating_armor_" + id + "_armor_equipped"]);
            
            if (value["repeating_armor_" + id + "_armor_equipped"] == "on")
                {
                if (info.triggerName.includes("bonus"))
                    {
                    await setAttrsAsync({["equipped_armor_bonus_hp"]: info.newValue});
                    }
                    else
                    {
                    await setAttrsAsync({["equipped_armor_hp"]: info.newValue});
                    }
                }
            }
        }
    }

on ("change:repeating_armor:armor_equipped", equipArmor);

async function equipArmor(info)
    {
    if (info.sourceType == "player")
        {
        var ids = await getSectionIDsAsync("armor");
        var id = info.triggerName.split("_")[2];
        
        for (var i=0; i<ids.length; i++)
            {
            var values = await getAttrsAsync(["repeating_armor_" + ids[i] + "_armor_equipped",
                                              "repeating_armor_" + ids[i] + "_armor_da",
                                              "repeating_armor_" + ids[i] + "_armor_cmr",
                                              "repeating_armor_" + ids[i] + "_armor_hp",
                                              "repeating_armor_" + ids[i] + "_armor_slow",
                                              "repeating_armor_" + ids[i] + "_armor_bonus_hp"]);
                                              
            console.log(values);
                                              
            if (values["repeating_armor_" + ids[i] + "_armor_equipped"] == "on" &&
                ids[i] != id)
                {
                await setAttrsAsync({["repeating_armor_" + ids[i] + "_armor_equipped"]: "0"});
                }
                else if (values["repeating_armor_" + id + "_armor_equipped"] == "on")
                {
                await setAttrsAsync({["equipped_armor_da"]: values["repeating_armor_" + ids[i] + "_armor_da"],
                                     ["equipped_armor_cmr"]: values["repeating_armor_" + ids[i] + "_armor_cmr"],
                                     ["equipped_armor_slow"]: values["repeating_armor_" + ids[i] + "_armor_slow"],
                                     ["equipped_armor_hp"]: values["repeating_armor_" + ids[i] + "_armor_hp"],
                                     ["equipped_armor_bonus_hp"]: values["repeating_armor_" + ids[i] + "_armor_bonus_hp"],
                                     ["equipped_armor_id"]: id});
                }
                else if (ids[i] == id)
                {
                await setAttrsAsync({["equipped_armor_da"]: "0",
                                     ["equipped_armor_cmr"]: "0",
                                     ["equipped_armor_slow"]: "0",
                                     ["equipped_armor_hp"]: "0",
                                     ["equipped_armor_bonus_hp"]: "0",
                                     ["equipped_armor_id"]: "0"});
                }
            }
        }
    }
    
on ("change:repeating_weapons:weapon_name change:repeating_melees:melee_name", updateEquippedWeaponName);

async function updateEquippedWeaponName(info)
    {
    if (info.sourceType == "player")
        {
        var id = info.triggerName.split("_")[2];
        var name;
        melee = info.triggerName.split("_")[1] == "melees";
        
        if (melee)
            {
            values = await getAttrsAsync(["repeating_melees_" + id + "_melee_name"]);
            name = values["repeating_melees_" + id + "_melee_name"];
            }
            else
            {
            values = await getAttrsAsync(["repeating_weapons_" + id + "_weapon_name"]);
            name = values["repeating_weapons_" + id + "_weapon_name"];
            }
            
        for (i=1; i<4; i++)
            {
            values2 = await getAttrsAsync(["equipped_weapon" + i + "_id"]);
            if (values2["equipped_weapon" + i + "_id"].toLowerCase() == id.toLowerCase())
                {
                await setAttrsAsync({["equipped_weapon" + i]: name});
                }
            }
        }
    }

on ("change:repeating_weapons:weapon_equipped change:repeating_melees:melee_equipped", equipWeapon);

async function equipWeapon(info)
    {
    if (info.sourceType == "player")
        {
        var ids = await getSectionIDsAsync("weapons");
        var melee_ids = await getSectionIDsAsync("melees");
        var count = 0;
        var id = info.triggerName.split("_")[2];
        melee = info.triggerName.split("_")[1] == "melees";
        
        for (var i=0; i<ids.length; i++)
            {
            var values = await getAttrsAsync(["repeating_weapons_" + ids[i] + "_weapon_equipped",
                                              "repeating_weapons_" + ids[i] + "_weapon_name"]);
            if (values["repeating_weapons_" + ids[i] + "_weapon_equipped"] == "on")
                {
                count++;
                }
            }
            
        for (var i=0; i<melee_ids.length; i++)
            {
            var values = await getAttrsAsync(["repeating_melees_" + melee_ids[i] + "_melee_equipped",
                                              "repeating_melees_" + melee_ids[i] + "_melee_name"]);
            if (values["repeating_melees_" + melee_ids[i] + "_melee_equipped"] == "on")
                {
                count++;
                }
            }
            
        console.log(count);
            
        if (count < 4)
            {
            console.log(JSON.stringify(values))
            count = 1;
            for (var i=0; i<ids.length; i++)
                {
                var values = await getAttrsAsync(["repeating_weapons_" + ids[i] + "_weapon_equipped",
                                                  "repeating_weapons_" + ids[i] + "_weapon_name"]);
                if (values["repeating_weapons_" + ids[i] + "_weapon_equipped"] == "on")
                    {
                    await setAttrsAsync({["equipped_weapon" + count + "_id"]: ids[i],
                                         ["equipped_weapon" + count + "_melee"]: "0",
                                         ["equipped_weapon" + count]: values["repeating_weapons_" + ids[i] + "_weapon_name"]});
                    count++;
                    }
                }
                
            for (var i=0; i<melee_ids.length; i++)
                {
                var values = await getAttrsAsync(["repeating_melees_" + melee_ids[i] + "_melee_equipped",
                                                  "repeating_melees_" + melee_ids[i] + "_melee_name"]);
                if (values["repeating_melees_" + melee_ids[i] + "_melee_equipped"] == "on")
                    {
                    await setAttrsAsync({["equipped_weapon" + count + "_id"]: melee_ids[i],
                                         ["equipped_weapon" + count + "_melee"]: "1",
                                         ["equipped_weapon" + count]: values["repeating_melees_" + melee_ids[i] + "_melee_name"]});
                    count++;
                    }
                }
            
            for (var i=count; i<4; i++)
                {
                await setAttrsAsync({["equipped_weapon" + count + "_id"]: "0",
                                     ["equipped_weapon" + count + "_melee"]: "-1",
                                     ["equipped_weapon" + count]: ""});
                }
            }
            else
            {
            if (!melee)
                {
                await setAttrsAsync({["repeating_weapons_" + id + "_weapon_equipped"]: "0"});
                }
                else
                {
                await setAttrsAsync({["repeating_melees_" + id + "_melee_equipped"]: "0"});
                }
            }
        }
    }

on ("change:wil change:pain_from_damage change:pain_modifier", setPain);

async function setPain()
    {
    var values = await getAttrsAsync(["wil", "pain_from_damage", "pain_modifier"]);
    var wil = Number(values.wil);
    var pfd = Number(values.pain_from_damage);
    var pm = Number(values.pain_modifier);
    
    await setAttrsAsync({"pain": Math.min(0, wil + pfd + pm)});
    }

on ("clicked:repeating_backgrounds:delete clicked:repeating_weapons:delete clicked:repeating_armor:delete clicked:repeating_ammo:delete clicked:repeating_advantages:delete clicked:repeating_resources:delete", deleteLine);

async function deleteLine(info)
    {
    if (info.sourceAttribute.includes("weapons"))
        {
        var id = info.sourceAttribute.split("_")[2];
        var values = await getAttrsAsync(["repeating_weapons_" + id + "_weapon_equipped"]);
        if (values["repeating_weapons_" + id + "_weapon_equipped"] == "on")
            {
            var values2 = await getAttrsAsync(["equipped_weapon1_id", "equipped_weapon2_id", "equipped_weapon3_id"]);
            console.log(values2);
            var toRemove = "";
            if (values2.equipped_weapon1_id.toLowerCase() == id.toLowerCase())
                {
                toRemove = "equipped_weapon1";
                }
                else if (values2.equipped_weapon2_id.toLowerCase() == id.toLowerCase())
                {
                toRemove = "equipped_weapon2";
                }
                else if (values2.equipped_weapon3_id.toLowerCase() == id.toLowerCase())
                {
                toRemove = "equipped_weapon3";
                }
                
            if (toRemove != "")
                {
                await setAttrsAsync({[toRemove]: "", [toRemove + "_id"]: "0"});
                }
            }
        }
        
    if (info.sourceAttribute.includes("armor"))
        {
        var id = info.sourceAttribute.split("_")[2];
        var values = await getAttrsAsync(["repeating_armor_" + id + "_armor_equipped"]);
        if (values["repeating_armor_" + id + "_armor_equipped"] == "on")
            {
            await setAttrsAsync({["equipped_armor_id"]: 0,
                                 ["equipped_armor_da"]: 0,
                                 ["equipped_armor_slow"]: 0,
                                 ["equipped_armor_cmr"]: 0,
                                 ["equipped_armor_hp"]: 0,
                                 ["equipped_armor_bonus_hp"]: 0});
            }
        }
        
    removeRepeatingRow("repeating_" + info.sourceAttribute.split('_')[1] + "_" + info.sourceAttribute.split('_')[2]);
    }

on ("clicked:addLine", addLine);

async function addLine(info)
    {
    var id = generateRowID();
    console.log("repeating_" + info.htmlAttributes.value + "_" + id + "_" + info.htmlAttributes.value + "_generator");
    await setAttrsAsync({["repeating_" + info.htmlAttributes.value + "_" + id + "_" + info.htmlAttributes.value + "_generator"]: "1"});
    }

on ("change:cc_bridge_tech_talent change:cc_mounted_weaponry_talent  change:cc_pilot_spacecraft_talent change:cc_vehicle_engineering_talent change:cc_drive_ground_vehicle_talent change:cc_knowledge_corporate_talent change:cc_knowledge_planets_talent change:cc_knowledge_urban_talent change:cc_pilot_aircraft_talent change:cc_trade_talent change:cc_aim_talent change:cc_athletics_talent change:cc_endurance_talent change:cc_melee_talent change:cc_reaction_talent change:cc_throw_talent change:cc_notice_talent change:cc_hack_security_talent change:cc_search_talent change:cc_sleight_of_hand_talent change:cc_sneak_talent change:cc_astronomy_talent change:cc_computer_science_talent change:cc_medicine_talent change:cc_natural_sciences_talent change:cc_robotics_talent change:cc_weapons_engineering_talent change:cc_xenobiology_talent change:cc_convince_talent change:cc_deceive_talent change:cc_empathy_talent change:cc_intimidate_talent change:cc_lead_talent", changeTalent);

async function changeTalent(info)
    {
    if (info.sourceType != "player")
        {
        return;
        }
        
    var xpInfo = await getXPData();
    console.log(xpInfo);
    
    var skillName = info.sourceAttribute.substring(3);
    skillName = skillName.substring(0, skillName.length - 7);
    var values = await getAttrsAsync(["territory_select", "planet_select", "talent", skillName, skillName + "_difficulty", "planet_talent_spent"]);
    var skill = Number(values[skillName]);
    var difficulty = Number(values[skillName + "_difficulty"]) - xpInfo.skillDiffOff;
    console.log(skillName);
    var max = 1;
    
    var debugString = "Talent change in category: " + skillToCategory(skillName) + "\n" + values.planet_talent_spent + "\n" + planet_select;
    
    if (skillToCategory(skillName) == values.planet_select)
        {
        max++;
        debugString += max + ": Planet\n";
        }
        
    if (values.territory_select == "omkinara")
        {
        max++;
        debugString += max + ": Omkinara\n";
        max = Math.min(max, difficulty - 4 + xpInfo.skillDiffOff);
        }
        else
        {
        max = Math.min(max, difficulty - 5 + xpInfo.skillDiffOff);
        }
        
    debugString += max + ": Skill level\n";
        
    if (skillToCategory(skillName) != values.planet_select &&
        values.planet_talent_spent == "0")
        {
        max = Math.min(max, Number(values.talent) - 1);
        debugString += max + ": Planet\n";
        }
        
    console.log(debugString);
        
    var talent = Number(values.talent);
    var prev;
    if (info.hasOwnProperty("previousValue"))
        {
        prev = Number(info.previousValue);
        }
        else
        {
        prev = 0;
        }
    var newV = Number(info.newValue);
    
    //console.log("Talent: " + talent + ", prev: " + prev + ", newV: " + newV, ", info" + JSON.stringify(info) + ", to set: " + "cc_" + skillName + "_talent");
    
    var delta = Math.max(prev * -1, Math.min(max - prev, Math.min(talent, newV - prev)));
    
    //console.log("Delta: " + delta);
    
    await setAttrsAsync({"talent": "" + (talent - delta),
                         [skillName + "_talent"]: "" + (prev + delta),
                         ["cc_" + skillName + "_talent"]: "" + (prev + delta)});
                         
    setSocialSkillSpent(skillToCategory(skillName));
    
    if (delta != 0)
        {                  
        var values2 = await getAttrsAsync([skillName + "_bonus", skillName + "_talent", "spent_xp", "total_xp"]);
        var bonus = Number(values2[skillName + "_bonus"]);
        var xpMultiplier = 0;
        var spent = Number(values2["spent_xp"]);
        var total = Number(values2["total_xp"]);
        var available = total-spent;
        var skillTalent = Number(values2[skillName + "_talent"]);
        for (var i=0; i<bonus; i++)
            {
            xpMultiplier += skill - i;
            }
            
        var xpDelta = xpMultiplier * delta;
        var skillDelta = 0;
        while (-xpDelta > available)
            {
            xpDelta += (skill - skillDelta) * (skillTalent + delta);
            skillDelta++;
            }
        
        await setAttrsAsync({"spent_xp": spent - xpDelta,
                            [skillName]: skill - skillDelta});
                            
        await setXP();
        await enableCCComplete();
        }
    }
    
async function setSocialSkillSpent(category)
    {
    var values;
    switch (category)
        {
        case "a":
            values = await getAttrsAsync(["drive_ground_vehicle", "knowledge_corporate", "knowledge_planets", "knowledge_urban", "pilot_aircraft", "trade"]);
        break;
        
        case "b":
            values = await getAttrsAsync(["convince", "deceive", "empathy", "intimidate", "lead"]);
        break;
        
        case "c":
            values = await getAttrsAsync(["notice", "hack_security", "search", "sleight_of_hand", "sneak"]);
        break;
        
        case "d":
            values = await getAttrsAsync(["aim", "athletics", "endurance", "melee", "reaction"]);
        break;
        
        case "e":
            values = await getAttrsAsync(["astronomy", "computer_science", "medicine", "natural_sciences", "robotics", "weapons_engineering"]);
        break;
        
        case "f":
            values = await getAttrsAsync(["bridge_tech", "vehicle_engineering", "pilot_spacecraft", "mounted_weaponry"]);
        break;
        }
    
    console.log(values);
    var spent = false;
    for (var key in values)
		{
		if (Number(values[key]) > 0)
            {
            spent = true;
            }
		}
    console.log(spent);
        
    if (spent)
        {
        await setAttrsAsync({"planet_talent_spent": "1"});
        }
        else
        {
        await setAttrsAsync({"planet_talent_spent": "0"});
        }
    }
    
function skillToCategory(skill)
    {
    switch (skill)
        {
        case "bridge_tech":
        case "vehicle_engineering":
        case "pilot_spacecraft":
        case "mounted_weaponry":
            return "f";
        break;
        
        case "drive_ground_vehicle":
        case "knowledge_corporate":
        case "knowledge_planets":
        case "knowledge_urban":
        case "pilot_aircraft":
        case "trade":
            return "a";
        break;
        
        case "aim":
        case "athletics":
        case "endurance":
        case "melee":
        case "reaction":
            return "d";
        break;
        
        case "notice":
        case "hack_security":
        case "search":
        case "sleight_of_hand":
        case "sneak":
            return "c";
        break;
        
        case "astronomy":
        case "computer_science":
        case "medicine":
        case "natural_sciences":
        case "robotics":
        case "weapons_engineering":
            return "e";
        break;
        
        case "convince":
        case "deceive":
        case "empathy":
        case "intimidate":
        case "lead":
            return "b";
        break;
        }
    }
    
async function enableCCComplete()
    {
    var values = await getAttrsAsync(["talent", "spent_xp", "cc_points"]);
    
    console.log(JSON.stringify(values));
    
    var xpInfo = await getXPData();
    
    if (Number(values.talent) == 0 &&
        Number(values.cc_points) < 4 &&
        Number(values.spent_xp) >= xpInfo.ccSkillXp)
        {
        await setAttrsAsync({"cc_complete_hider": 0});
        }
        else
        {
        await setAttrsAsync({"cc_complete_hider": 1});
        }
    }

on ("clicked:lead_cc_down clicked:intimidate_cc_down clicked:empathy_cc_down clicked:deceive_cc_down clicked:convince_cc_down clicked:xenobiology_cc_down clicked:weapons_engineering_cc_down clicked:robotics_cc_down clicked:natural_sciences_cc_down clicked:medicine_cc_down clicked:computer_science_cc_down clicked:astronomy_cc_down clicked:sneak_cc_down clicked:sleight_of_hand_cc_down clicked:search_cc_down clicked:hack_security_cc_down clicked:notice_cc_down clicked:throw_cc_down clicked:reaction_cc_down clicked:melee_cc_down clicked:endurance_cc_down clicked:athletics_cc_down clicked:aim_cc_down clicked:trade_cc_down clicked:pilot_aircraft_cc_down clicked:knowledge_urban_cc_down clicked:knowledge_planets_cc_down clicked:knowledge_corporate_cc_down clicked:drive_ground_vehicle_cc_down clicked:vehicle_engineering_cc_down clicked:pilot_spacecraft_cc_down clicked:mounted_weaponry_cc_down clicked:bridge_tech_cc_down", reduceSkillCC);

async function reduceSkillCC(info)
	{
	await reduceSkill(info.htmlAttributes.name.substring(4, info.htmlAttributes.name.length - 8));
	await enableCCComplete();
	}

on ("clicked:lead_cc_up clicked:intimidate_cc_up clicked:empathy_cc_up clicked:deceive_cc_up clicked:convince_cc_up clicked:xenobiology_cc_up clicked:weapons_engineering_cc_up clicked:robotics_cc_up clicked:natural_sciences_cc_up clicked:medicine_cc_up clicked:computer_science_cc_up clicked:astronomy_cc_up clicked:sneak_cc_up clicked:sleight_of_hand_cc_up clicked:search_cc_up clicked:hack_security_cc_up clicked:notice_cc_up clicked:throw_cc_up clicked:reaction_cc_up clicked:melee_cc_up clicked:endurance_cc_up clicked:athletics_cc_up clicked:aim_cc_up clicked:trade_cc_up clicked:pilot_aircraft_cc_up clicked:knowledge_urban_cc_up clicked:knowledge_planets_cc_up clicked:knowledge_corporate_cc_up clicked:drive_ground_vehicle_cc_up clicked:vehicle_engineering_cc_up clicked:pilot_spacecraft_cc_up clicked:mounted_weaponry_cc_up clicked:bridge_tech_cc_up", raiseSkillCC);

async function raiseSkillCC(info)
	{
	var fullName = info.htmlAttributes.name;
	await setAttrsAsync({"skill_to_change": fullName.substring(4, fullName.length - 6)});
	
	var info2 = {sourceType: "not player"};
	await raiseSkill(info);
	await enableCCComplete();
	}

on ("clicked:cc_back", ccBack);

async function ccBack()
	{
	var xpInfo = await getXPData();
    console.log(xpInfo);
	await setAttrsAsync({"cc2_prompt_hider": 1,
						 "cc1_prompt_hider": 0,
						 "total_xp": (xpInfo.ccSkillXp + 10) + "",
	                     "spent_xp": 0});
	init();
	await setXP();
	}

var arduloM2 = {name: "Ardulo -M2-", description: "", spread:"2", burst: "0", volley: "0", clip_ammo:"7", clip_capacity:"7", ammo:"A"};
var yamainu = {name: "Hamaji Yamainu", description: "", spread:"2", burst: "0", volley: "0", clip_ammo:"13", clip_capacity:"13", ammo:"D"};
var electroPistol = {name: "Electro Pistol", description: "damage: 1d6 electrical", spread:"6", burst: "0", volley: "0", clip_ammo:"5", clip_capacity:"5", ammo:"-"};
var arduloT4 = {name: "Ardulo T4", description: "Tiny, easily concealable", spread:"2", burst: "0", volley: "0", clip_ammo:"5", clip_capacity:"5", ammo:"A"};
var arduloMinotaur = {name: "Ardulo Minotaur", description: "", spread:"3", burst: "0", volley: "0", clip_ammo:"8", clip_capacity:"8", ammo:"B"};
var laserPistol = {name: "Laser Pistol", description: "damage: 1d6 + 1 thermal", spread:"1", burst: "0", volley: "0", clip_ammo:"5", clip_capacity:"5", ammo:"-"};

var combatPolymerSuit = {name: "Combat Polymer Suit", da: "1", slow:"0", hp:"1", max_hp:"1", bonus_hp:"0", max_bonus_hp:"0", cmr:"15"};
var lightMilitiaArmor = {name: "Light Militia Armor", da: "2", slow:"1", hp:"1", max_hp:"1", bonus_hp:"0", max_bonus_hp:"0", cmr:"10"};
var heavyMilitiaArmor = {name: "Heavy Militia Armor", da: "3", slow:"2", hp:"2", max_hp:"2", bonus_hp:"0", max_bonus_hp:"0", cmr:"5"};
var lightCombatArmor = {name: "Light Combat Armor", da: "2", slow:"0", hp:"3", max_hp:"3", bonus_hp:"5", max_bonus_hp:"5", cmr:"10"};

var ammoA = {ammo_class: "A", variant:"Standard", damage:"1d6 + 1 ballistic", amount:"30"};
var ammoB = {ammo_class: "B", variant:"Standard", damage:"1d6 + 3 ballistic", amount:"30"};
var ammoD = {ammo_class: "D", variant:"Standard", damage:"1d8 + 1 ballistic", amount:"30"};
on ("clicked:cc2_complete", closeCC);

async function closeCC()
	{
	var values = await getAttrsAsync(["cc_points", "profession_select", "social_class_select"]);
	var xpInfo = await getXPData();
    console.log(xpInfo);
	await setAttrsAsync({"cc2_prompt_hider": 1,
						 "total_xp": 100 + Number(values.cc_points) * xpInfo.attrCost + xpInfo.ccSkillXp});
	await setXP();
	
	switch (values.social_class_select)
	    {
	    case "wretch":
	        var id = generateRowID();
	        await setAttrsAsync({["repeating_resources_" + id + "_generator"]: "1",
                                 ["repeating_resources_" + id + "_resource_name"]: "False Identity",
                                 ["repeating_resources_" + id + "_resource_level"]: "2",
                                 ["repeating_resources_" + id + "_resource_cost"]: "0"});
                                 
            id = generateRowID();
	        await setAttrsAsync({["repeating_resources_" + id + "_generator"]: "1",
                                 ["repeating_resources_" + id + "_resource_name"]: "Fixer",
                                 ["repeating_resources_" + id + "_resource_level"]: "1",
                                 ["repeating_resources_" + id + "_resource_cost"]: "0"});
	    break;
	    
	    case "middle_class":
	        var id = generateRowID();
	        await setAttrsAsync({["repeating_resources_" + id + "_generator"]: "1",
                                 ["repeating_resources_" + id + "_resource_name"]: "Fixer",
                                 ["repeating_resources_" + id + "_resource_level"]: "2",
                                 ["repeating_resources_" + id + "_resource_cost"]: "0"});
                                 
            id = generateRowID();
	        await setAttrsAsync({["repeating_resources_" + id + "_generator"]: "1",
                                 ["repeating_resources_" + id + "_resource_name"]: "Thaler Account",
                                 ["repeating_resources_" + id + "_resource_level"]: "1",
                                 ["repeating_resources_" + id + "_resource_cost"]: "0",
	                             "money": "5000"});
	    break;
	    
	    case "low_corporate":
	        var id = generateRowID();
	        await setAttrsAsync({["repeating_resources_" + id + "_generator"]: "1",
                                 ["repeating_resources_" + id + "_resource_name"]: "Thaler Account",
                                 ["repeating_resources_" + id + "_resource_level"]: "2",
                                 ["repeating_resources_" + id + "_resource_cost"]: "0",
	                             "money": "15000"});
                                 
            id = generateRowID();
	        await setAttrsAsync({["repeating_resources_" + id + "_generator"]: "1",
                                 ["repeating_resources_" + id + "_resource_name"]: "Jimmy Knowemall",
                                 ["repeating_resources_" + id + "_resource_level"]: "1",
                                 ["repeating_resources_" + id + "_resource_cost"]: "0"});
	    break;
	    }
	
	var ccWeapon;
	var ccArmor;
	var ccAmmo;
	
	switch (values.profession_select)
	    {
	    case "soldier":
	        await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard dagger, consumer grade tablet",
	                             "other_gear": "uniform"});
	        ccWeapon = yamainu;
	        ccArmor = lightCombatArmor;
	        ccAmmo = ammoD;
		break;

		case "law_enforcer":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, voltaic baton, 1 Turbo, consumer grade tablet",
	                             "other_gear": "uniform"});
	        ccWeapon = electroPistol;
	        ccArmor = heavyMilitiaArmor;
	        ccAmmo = null;
		break;

		case "scientist":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, handheld scancorder, <SELECT 2 CHEMS>, business grade tablet",
	                             "other_gear": "labwear"});
	        ccWeapon = arduloM2;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = ammoA;
		break;

		case "doctor":
		    await setAttrsAsync({"carried_gear": "3 S.E.A.L.-s, 1 combat com, standard clothes, first aid kit, consumer grade tablet",
	                             "other_gear": "labwear"});
	        ccWeapon = arduloM2;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = ammoA;
		break;

		case "spy":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, bug, tracking device, business grade tablet",
	                             "other_gear": "set of elegant clothes"});
	        ccWeapon = yamainu;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = ammoD;
		break;

		case "smuggler":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, 1 Focus, consumet grade tablet",
	                             "other_gear": "civilian space suit, protective workwear"});
	        ccWeapon = arduloM2;
	        ccArmor = lightMilitiaArmor;
	        ccAmmo = ammoA;
		break;

		case "thief":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, 10m carbon fiber cable with serrated tips, ZX7, consumer grade tablet",
	                             "other_gear": "set of sneakwear"});
	        var id = generateRowID();
	        await setAttrsAsync({["repeating_weapons_" + id + "_generator"]: "1",
                                 ["repeating_weapons_" + id + "_weapon_name"]: "Scorpion",
                                 ["repeating_weapons_" + id + "_weapon_spread"]: "3",
                                 ["repeating_weapons_" + id + "_weapon_burst"]: "0",
                                 ["repeating_weapons_" + id + "_weapon_volley"]: "0",
                                 ["repeating_weapons_" + id + "_weapon_clip_ammo"]: "1",
                                 ["repeating_weapons_" + id + "_weapon_clip_capacity"]: "1",
                                 ["repeating_weapons_" + id + "_weapon_ammo"]: "CFB"});
	        ccWeapon = arduloM2;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = ammoA;
		break;

		case "swindler":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, bug, business grade tablet, 1 Focus",
	                             "other_gear": "set of elegant clothing"});
	        ccWeapon = arduloT4;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = ammoA;
		break;

		case "pilot":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, vehicle toolkit, consumer grade tablet",
	                             "other_gear": "civilian space suit, set of protective workwear"});
	        ccWeapon = arduloM2;
	        ccArmor = lightMilitiaArmor;
	        ccAmmo = ammoA;
		break;

		case "engineer":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, 1 Focus, <SELECT 1 SHIELD OF AVAILABILITY I>, <SELECT 1 TOOLKIT>, business grade tablet",
	                             "other_gear": "set of protective workwear"});
	        ccWeapon = arduloMinotaur;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = ammoB;
		break;

		case "trader":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, 1 Focus, business grade tablet, com tap",
	                             "other_gear": "set of elegant clothing"});
	        ccWeapon = arduloM2;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = ammoA;
		break;

		case "astronaut":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, 1 Focus, vehicle toolkit",
	                             "other_gear": "civilian space suit, set of protective workwear"});
	        ccWeapon = laserPistol;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = null;
		break;

		case "socialite":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, 2 Clear, 1 Focus, business grade tablet, 1 piece of real jewelry",
	                             "other_gear": "set of elegant clothing"});
	        ccWeapon = arduloT4;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = ammoA;
		break;
		
		case "hacker":
		    await setAttrsAsync({"carried_gear": "1 S.E.A.L., 1 combat com, standard clothes, 1 Focus, jailbroken tablet (software level 6, memory 8, loaded with hacking I, antivirus III and encryption I), 1 piece of real jewelry",
	                             "other_gear": "set of elegant clothing"});
	        ccWeapon = arduloM2;
	        ccArmor = combatPolymerSuit;
	        ccAmmo = ammoA;
		break;
	    }
	    
	var id = generateRowID();
    await setAttrsAsync({["repeating_weapons_" + id + "_generator"]: "1",
                         ["repeating_weapons_" + id + "_weapon_name"]: ccWeapon.name,
                         ["repeating_weapons_" + id + "_weapon_spread"]: ccWeapon.spread,
                         ["repeating_weapons_" + id + "_weapon_burst"]: ccWeapon.burst,
                         ["repeating_weapons_" + id + "_weapon_volley"]: ccWeapon.volley,
                         ["repeating_weapons_" + id + "_weapon_clip_ammo"]: ccWeapon.clip_ammo,
                         ["repeating_weapons_" + id + "_weapon_clip_capacity"]: ccWeapon.clip_capacity,
                         ["repeating_weapons_" + id + "_weapon_ammo"]: ccWeapon.ammo});
                          
    id = generateRowID();
    await setAttrsAsync({["repeating_armor_" + id + "_generator"]: "1",
                         ["repeating_armor_" + id + "_armor_name"]: ccArmor.name,
                         ["repeating_armor_" + id + "_armor_da"]: ccArmor.da,
                         ["repeating_armor_" + id + "_armor_cmr"]: ccArmor.cmr,
                         ["repeating_armor_" + id + "_armor_slow"]: ccArmor.slow,
                         ["repeating_armor_" + id + "_armor_hp"]: ccArmor.hp,
                         ["repeating_armor_" + id + "_armor_bonus_hp"]: ccArmor.bonus_hp,
                         ["repeating_armor_" + id + "_armor_max_hp"]: ccArmor.max_hp,
                         ["repeating_armor_" + id + "_armor_max_bonus_hp"]: ccArmor.max_bonus_hp});
                         
    if (ccAmmo != null)
        {
        id = generateRowID();
        await setAttrsAsync({["repeating_ammo_" + id + "_generator"]: "1",
                             ["repeating_ammo_" + id + "_ammo_class"]: ccAmmo.ammo_class,
                             ["repeating_ammo_" + id + "_ammo_variant"]: ccAmmo.variant,
                             ["repeating_ammo_" + id + "_ammo_damage"]: ccAmmo.damage,
                             ["repeating_ammo_" + id + "_ammo_quantity"]: "" + (Number(ccAmmo.amount) - Number(ccWeapon.clip_capacity))});
        }
	}

on ("clicked:cc1_complete", openCC2);

async function openCC2()
	{
	var xpInfo = await getXPData();
    console.log(xpInfo);
	await setAttrsAsync({"cc1_prompt_hider": 1,
						 "cc2_prompt_hider": 0,
						 "total_xp": xpInfo.ccSkillXp + 10,
	                     "spent_xp": 0});
	await setXP();
	await enableCCComplete();
	}

on ("change:gavadai_attribute1 change:gavadai_attribute2", setGavadaiAttribute);

async function setGavadaiAttribute(info)
	{
	await setAttrsAsync({"str_territory": 1, "sta_territory": 1, "wil_territory": 1, "agi_territory": 0, "per_territory": 0, "cha_territory": 0, "int_territory": 0});
	var values = await getAttrsAsync(["gavadai_attribute1", "gavadai_attribute2"]);
	var values2 = await getAttrsAsync([values["gavadai_attribute1"]+"_territory", values["gavadai_attribute2"]+"_territory"]);
	
	if (values["gavadai_attribute1"] == values["gavadai_attribute2"])
		{
		await setAttrsAsync({[values["gavadai_attribute1"]+"_territory"]: Number(values2[values["gavadai_attribute1"]+"_territory"]) + 2});
		}
		else 
		{
		await setAttrsAsync({[values["gavadai_attribute1"]+"_territory"]: Number(values2[values["gavadai_attribute1"]+"_territory"]) + 1,
							 [values["gavadai_attribute2"]+"_territory"]: Number(values2[values["gavadai_attribute2"]+"_territory"]) + 1});
		}
		
	await setAttributes();
	setCharacterInfo();
	}
	
on ("change:zaidong_augmentation change:saturnada_creature change:gt_robot", setCharacterInfo);

async function setCharacterInfo()
	{
	console.log("Setting character info.");
	var values = await getAttrsAsync(["str", "sta", "agi", "per", "int", "cha", "wil", "territory_select", "planet_select", "social_class_select", "profession_select", "hobby1", "hobby1_name", "language1", "language1_name", "language2", "language2_name", "gavadai_attribute1", "gavadai_attribute2", "saturnada_creature", "gt_robot", "zaidong_augmentation"]);
	var skills = await getAttrsAsync(["bridge_tech", "mounted_weaponry", "pilot_spacecraft", "vehicle_engineering", "drive_ground_vehicle", "knowledge_corporate", "knowledge_planets", "pilot_aircraft", "knowledge_urban", "trade", "aim", "athletics", "endurance", "reaction", "melee", "throw", "notice", "hack_security", "search", "sleight_of_hand", "sneak", "astronomy", "computer_science", "medicine", "natural_sciences", "robotics", "weapons_engineering", "xenobiology", "convince", "deceive", "empathy", "intimidate", "lead"]);
	
	var s = "Character stats:\n";
	s += "Attributes: Strength " + values["str"] + ", Stamina " + values["sta"] + ", Agility " + values["agi"] + ", Perception " + values["per"] + ", Intelligence " + values["int"] + ", Charisma " + values["cha"] + ", Willpower " + values["wil"] + "\n";
	s += "Skills: ";
	
	for (var key in skills)
		{
		if (skills[key] != "0")
			{
			s += await skillToName(key) + ": " + skills[key] + ", ";
			}
		}
		
	s = s.substring(0, s.length - 2);
	
	if (values["hobby1_name"] != "")
		{
		s += ", " + values["hobby1_name"] + ": " + values["hobby1"];
		}
		
	if (values["language1_name"] != "")
		{
		s += ", " + values["language1_name"] + ": " + values["language1"];
		}
		
	if (values["language2_name"] != "")
		{
		s += ", " + values["language2_name"] + ": " + values["language2"];
		}
		
	s += "\n\nCommonwealth advantage:\n";
	
	switch (values["territory_select"])
		{
		case "gavadai":
		    if (values["gavadai_attribute1"] != values["gavadai_attribute2"])
		        {
			    s += "Enhanced attributes: " + attributeToName(values["gavadai_attribute1"]) + " +1 and " + attributeToName(values["gavadai_attribute2"]) + " +1\n";
		        }
		        else
		        {
		        s += "Enhanced attribute: " + attributeToName(values["gavadai_attribute1"]) + " +2\n";
		        }
		break;
		
		case "gt":
			s += "Robot companion: " + values["gt_robot"] + "\n";
		break;
		
		case "saturnada":
			s += "Companion creature: " + values["saturnada_creature"] + "\n";
		break;
		
		case "zaidong":
			s += "Augmentation: " + values["zaidong_augmentation"] + "\n";
		break;
		
		case "omkinara":
			s += "Profession implant: +2 talent points.\n"
		break;
		
		case "syndeel":
			s += "Cybernetic affinity: neurocom and +3 Stamina for the purpose of implantaion.\n";
		break;
		
		case "tatsuba":
			s += "Combat training: bonus to aim, melee and reaction and 50% chance to gain an action point at the start of each combat turn.\n";
		break;
		
		case "imperial":
			s += "Battle core: You carry an imperial battle core, a powerful shapeshifting weapon.\n";
			s += "Disadvantage: Imperials are hunted and mistrusted, you must keep a low profile.\n"
		break;
		
		case "alliance":
			s += "Focus: You have 2 points of focus in each scene to enhance skill checks.\n";
			s += "Moral backbone: You have trouble ignoring suffering and injustice, at times you may be compelled to interfere in matter beyond your power.\n";
		break;
		
		case "pirate":
			s += "Personal shuttle: You carry a piece of hypertechnology that manifests a 1 man spacecraft of solid light you can use to travel freely.\n";
			s += "Disadvantage: You are a psychopath with no capacity for empathy.\n"
		break;
		}
		
	s += "\nType of birthplace:\n";
		
	switch (values["planet_select"])
		{
		case "a":
			s += "Class A planet: spend 1 point of talent in the Civilizational category.\n";
		break;
		
		case "b":
			s += "Class B planet: spend 1 point of talent in the Social category.\n";
		break;
		
		case "c":
			s += "Class C planet: spend 1 point of talent in the Infiltration category.\n";
		break;
		
		case "d":
			s += "Class D planet: spend 1 point of talent in the Combat category.\n";
		break;
		
		case "e":
			s += "Class E planet: spend 1 point of talent in the Science category.\n";
		break;
		
		case "f":
			s += "Space station: spend 1 point of talent in the Astronomics category.\n";
		break;
		}
		
	s += "\nSocial class:\n";
	
	switch (values["social_class_select"])
		{
		case "wretch":
			s += "Wretch: You gain the resources False Identity II and Market Contact I.\n";
		break;
		
		case "middle_class":
			s += "Middle class: You gain the resources Market Contact II and Thaler Account I.\n";
		break;
		
		case "low_corporate":
			s += "Low corporate: You gain the resources Thaler Account II and Faction Contact I.\n";
		break;
		}
		
	s += "\nOriginal profession: ";
	
	switch (values["profession_select"])
		{
		case "soldier":
			s += "Soldier.\nStarting gear: 1 S.E.A.L., combat com, light combat armor, standard dagger, Hamaji Yamainu, 30 class standard D ammunition, common consumer tablet. uniform.";
		break;
		
		case "law_enforcer":
			s += "Law enforcer.\nStarting gear: 1 S.E.A.L., combat com, heavy militia armor, electro-pistol, voltaic baton, 1 turbo, common consumer tablet, uniform.";
		break;
		
		case "scientist":
			s += "Scientist.\nStarting gear: 1 S.E.A.L., combat com, combat polymer suit, Ardulo M2, 30 standard A type ammo, handheld scancorder, any 2 chems, business grade tablet, labwear.";
		break;
		
		case "doctor":
			s += "Doctor.\nStarting gear: Combat com, combat polymer suit, Ardulo M2, 30 standard A type ammo, first aid kit, 3 S.E.A.L.-s, common consumer tablet, labwear.";
		break;
		
		case "spy":
			s += "Spy.\nStarting gear: 1 S.E.A.L., combat com, combat polymer suit, Hamaji Yamainu, 30 standard D type ammunition, bug, tracking device, business grade tablet, set of elegant clothes.";
		break;
		
		case "smuggler":
			s += "Smuggler.\nStarting gear: 1 S.E.A.L., combat com, light militia armor, Ardulo M2, 30 standard A type ammunition, civilian space suit, 1 focus, common consumer tablet, set of protective workwear.";
		break;
		
		case "thief":
			s += "Thief.\nStarting gear: 1 S.E.A.L., combat com, combat polymer suit, Ardulo M2, 30 standard A type ammunition, Scorpion, 10m carbon fiber cable with serrated tips, ZX7, common consumer tablet, set of sneakwear.";
		break;
		
		case "swindler":
			s += "Swindler.\nStarting gear: 1 S.E.A.L., combat com, combat polymer suit, Ardulo T4, 30 standard A type ammunition, bug, business grade tablet, 1 focus, set of elegant clothing.";
		break;
		
		case "pilot":
			s += "Pilot.\nStarting gear: 1 S.E.A.L., combat com, light militia armor, Ardulo M2, 30 standard A type ammunition, civilian space suit, vehicle toolkit, common consumer tablet, set of protective workwear.";
		break;
		
		case "engineer":
			s += "Engineer.\nStarting gear: 1 S.E.A.L., combat com, combat polymer suit, Ardulo Minotaur, 30 standard B type ammunition, 1 focus, personal shield generator I, toolkit of player's choice, business grade tablet, set of protective workwear.";
		break;
		
		case "trader":
			s += "Trader.\nStarting gear: 1 S.E.A.L., combat com, combat polymer suit, Ardulo M2, 30 standard type A ammunition, 1 focus, business grade tablet, com tap set of elegant clothing.";
		break;
		
		case "astronaut":
			s += "Astronaut.\nStarting gear: 1 S.E.A.L., combat com, combat polymer suit, laser pistol, 1 focus, civilian spacesuit, vehicle toolkit, business grade tablet, set of protective workwear.";
		break;
		
		case "socialite":
			s += "Socialite.\nStarting gear: 1 S.E.A.L., combat com, combat polymer suit, Ardulo T4, 30 standard type A ammunition, 2 clear, 1 focus, business grade tablet, set of elegant clothing, 1 piece of real jewelry.";
		break;
		
		case "hacker":
			s += "Hacker.\nStarting gear: 1 S.E.A.L., combat com, combat polymer suit, Ardulo M2, 30 standard type A ammunition, 1 focus,  jailbroken tablet (software level 6, memory 8) with hacking I, antivirus III and encryption I.";
		break;
		
		case "other":
			s += "Other.";
		break;
		}
		
	await setAttrsAsync({"character_info": s});
	}
	
function attributeToName(attribute)
	{
	switch (attribute)
		{
		case "str":
			return "Strength";
		break;
		
		case "sta":
			return "Stamina";
		break;
		
		case "agi":
			return "Agility";
		break;
		
		case "per":
			return "Perception";
		break;
		
		case "int":
			return "Intelligence";
		break;
		
		case "cha":
			return "Charisma";
		break;
		
		case "wil":
			return "Willpower";
		break;
		}
	}

async function setAttribute(attribute)
	{
	var values = await getAttrsAsync([attribute+"_territory", attribute+"_social", attribute+"_planet", attribute+"_profession", attribute+"_xp", attribute+"_cc"]);
	var t = Number(values[attribute+"_territory"]);
	var s = Number(values[attribute+"_social"]);
	var l = Number(values[attribute+"_planet"]);
	var p = Number(values[attribute+"_profession"]);
	var x = Number(values[attribute+"_xp"]);
	var c = Number(values[attribute+"_cc"]);
	
	setAttrsAsync({[attribute]: 2 + t + s + l + p + x + c});
	}
	
async function setAttributes()
	{
	await setAttribute("str");
	await setAttribute("sta");
	await setAttribute("agi");
	await setAttribute("per");
	await setAttribute("int");
	await setAttribute("cha");
	await setAttribute("wil");
	}

//-------------------------------------------------------------------------------------
on ("clicked:roll_condition", rollCondition);

async function rollCondition(info)
    {
    var values = await getAttrsAsync(["pain"]);
    var modLevel = Number(values["pain"]) / -2;
    
    var rollString = "&{template:hi-assist} {{name=@{name}}} {{title=: Condition: }} {{roll1=[[abs(1d4-1d4) + " + modLevel + "]]}}";
    rerollString = rollString;
    
    startRoll(rollString, conditionRollCallback);
    }
    
async function conditionRollCallback(resultData)
    {
    var rollResult = resultData.results.roll1.result;
    
    var computed = "wtf?";
    
    switch (rollResult)
        {
        case 0:
            computed = "Stable, quickly healing";
        break;
        
        case 1:
            computed = "Stable, normally healing";
        break;
        
        case 2:
            computed = "Stable, slowly healing";
        break;
        
        case 3:
            computed = "Slowly degrading";
        break;
        
        case 4:
            computed = "Degrading";
        break;
        
        case 5:
            computed = "Quickly degrading";
        break;
        
        case 6:
            computed = "Critical";
        break;
        
        case 7:
            computed = "Dead";
        break;
        }
    
    finishRoll(resultData.rollId, {roll1: computed});
    }

on ("clicked:roll_initiative", initiative);

async function initiative(info)
    {
    var values = await getAttrsAsync(["agi", "per", "init_mod"]);
    
    var modifier = Math.max(Number(values.agi), Number(values.per));
    
    var rollString = "&{template:hi-assist} {{name=@{name}}} {{title=: Initiative (" + values["init_mod"] + "): }} {{roll1=[[1d12 + " + modifier + " + @{init_mod}]]}}";
    
    startRoll(rollString, skillCheckCallback);
    }

on ("clicked:reroll", reroll);

var rerollString = "";

async function reroll(info)
    {
    var values = await getAttrsAsync(["gf"]);
    if (rerollString != "" && isInteger(values.gf) && Number(values.gf) > 0)
        {
        startRoll(rerollString, skillCheckCallback);
        await setAttrsAsync({"gf": (Number(values.gf) - 1) + ""});
        }
    }

on("change:money", changeMoney);

async function changeMoney(info)
    {
    var values = await getAttrsAsync(["money"]);
    
    var money = Number(values["money"]);
    
    await setAttrsAsync({"petty_cash": Math.floor(money/1000.0) + "",
                         "resupply": Math.floor(money/50.0) + ""});
    }
    
async function getXPData()
    {
    var xpInfo = {};
    var values = await getAttrsAsync(["skill_difficulty_offset", "attribute_cost", "max_attribute_points", "cc_skill_xp"]);
    
    xpInfo.skillDiffOff = Number(values.skill_difficulty_offset);
    xpInfo.attrCost = Number(values.attribute_cost);
    xpInfo.maxAttrPoints = Number(values.max_attribute_points);
    xpInfo.ccSkillXp = Number(values.cc_skill_xp);
    
    return xpInfo;
    }

on ("clicked:reduce_skill", reduceSkill);

async function reduceSkill(skillToRaise)
    {
    var values = await getAttrsAsync([skillToRaise, skillToRaise + "_difficulty", skillToRaise + "_bonus", skillToRaise + "_talent", "skill_xp", "spent_xp"]);
    var xpInfo = await getXPData();
    console.log(xpInfo);
    
    if (Number(values[skillToRaise + "_bonus"]) > 0)
        {
        var skill = Number(values[skillToRaise]);
        var difficulty = Number(values[skillToRaise + "_difficulty"]);
        var talent = Number(values[skillToRaise + "_talent"]);
        var xpDue = skill * (difficulty - talent - xpInfo.skillDiffOff);
        var bonus = Number(values[skillToRaise + "_bonus"]);
        
        var toSet = {[skillToRaise]: "" + (skill - 1),
                     [skillToRaise + "_bonus"]: "" + (bonus - 1),
                    "spent_xp": (Number(values["spent_xp"]) - xpDue) + ""};
        
        await setAttrsAsync(toSet);
        }
    }

var firingModeOptions =
	[
	{label: "Single", value: "single", selected: "true", disabled: "true"},
	{label: "Burst", value: "burst", disabled: "true"},
	{label: "Volley", value: "volley", disabled: "true"},
	{label: "Melee Strike", value: "melee", disabled: "true"}
	];
	
var shooterId;

on ("clicked:shoot", fireWeapon);

async function fireWeapon()
	{
	var values = await getAttrsAsync(["firing_mode"]);
	
	var firingMode = values.firing_mode;
	console.log(firingMode);
	if (firingMode != "melee")
	    {
    	var shootBonus = 0;
    	
    	if (firingMode == "single" && weapon.clip_ammo > 0)
    		{
    		await setAttrsAsync({["repeating_weapons_" + weapon.id + "_weapon_clip_ammo"]: weapon.clip_ammo - 1,
    				  			 "shoot_prompt_hider": 1});
    		}
    
    	if (firingMode == "burst" && weapon.burst <= weapon.clip_ammo)
    		{
    		await setAttrsAsync({["repeating_weapons_" + weapon.id + "_weapon_clip_ammo"]: weapon.clip_ammo - weapon.burst,
    				  			 "shoot_prompt_hider": 1});
    		shootBonus = 2;
    		}
    		
    	if (firingMode == "volley" && weapon.volley <= ammo)
    		{
    		await setAttrsAsync({["repeating_weapons_" + weapon.id + "_weapon_clip_ammo"]: weapon.clip_ammo - weapon.volley,
    				  			 "shoot_prompt_hider": 1});
    		shootBonus = 4;
    		}
    		
    	var rollString = "&{template:hi-roll} {{name=@{name}}} {{title= fires their " + weapon.name + ": }} {{roll1=[[1d12 + @{per} + @{aim} + @{pain} + @{shoot_modifier} + " + shootBonus + "]]}}";
    	
    	rerollString = rollString;
    	startRoll(rollString, shootCallback);
	    }
	    else
	    {
	    var rollString = "&{template:hi-roll} {{name=@{name}}} {{title= punches with their " + weapon.name + ": }} {{roll1=[[1d12 + @{agi} + @{melee} + @{pain} + @{shoot_modifier}]]}}";
    	
    	rerollString = rollString;
    	startRoll(rollString, shootCallback);
	    }
	}
	
function shootCallback(result)
	{
	finishRoll(result.rollId);
	}

on ("clicked:cancel_shoot", closeShootPrompt);

async function closeShootPrompt()
	{
	await setAttrsAsync({"shoot_prompt_hider": 1});
	}

on ("clicked:open_shoot clicked:repeating_weapons:openshoot clicked:repeating_melees:openshoot", openShootPrompt);

var weapon = {};

async function openShootPrompt(info)
	{
	console.log("opening shoot");
	var number = Number(info.htmlAttributes.value);
	var id;
	var melee = false;
	
	if (number < 4)
	    {
	    var values = await getAttrsAsync(["equipped_weapon" + number + "_id", "equipped_weapon" + number + "_melee"]);
	    melee = values["equipped_weapon" + number + "_melee"] == 1;
	    id = values["equipped_weapon" + number + "_id"];
	    }
	    else
	    {
	    melee = info.sourceAttribute.split("_")[1] == "melees";
	    console.log(info.sourceAttribute);
	    id = info.sourceAttribute.split("_")[2];
	    }
	    
	var options = structuredClone(firingModeOptions);
	    
	if (!melee)
	    {
    	var values = await getAttrsAsync(["repeating_weapons_" + id + "_weapon_name",
    	                                   "repeating_weapons_" + id + "_weapon_burst",
    	                                   "repeating_weapons_" + id + "_weapon_volley",
    	                                   "repeating_weapons_" + id + "_weapon_clip_capacity",
    	                                   "repeating_weapons_" + id + "_weapon_clip_ammo"]);
    	                                   
    	weapon["name"] = values["repeating_weapons_" + id + "_weapon_name"];
    	weapon["burst"] = Number(values["repeating_weapons_" + id + "_weapon_burst"]);
    	weapon["volley"] = Number(values["repeating_weapons_" + id + "_weapon_volley"]);
    	weapon["clip_capacity"] = Number(values["repeating_weapons_" + id + "_weapon_clip_capacity"]);
    	weapon["clip_ammo"] = Number(values["repeating_weapons_" + id + "_weapon_clip_ammo"]);
    	weapon["id"] = id;
    	
    	console.log(weapon);
    	
    	for (var key in weapon)
    		{
    		if (weapon[key] == NaN)
    			{
    			weapon[key] = 0;
    			}
    		}
    	
    	if (weapon.name == "" ||
    	    weapon.name == undefined)
    	    {
    	    return;
    	    }
    	
    	await setAttrsAsync({"firing_text": "Fire " + weapon.name,
    					  	 "shoot_prompt_hider": 0,
    					  	 "shoot_hider": 0});
    
    	if (weapon.clip_ammo > 0)
    		{
    		delete options[0].disabled;
    		}
    		else
    		{
    		await setAttrsAsync({"shoot_hider": 1});
    		}
    
    	if (weapon.burst > 1)
    		{
    		if (weapon.burst <= weapon.clip_ammo)
    			{
    			delete options[1].disabled;
    			}
    		}
    
    	if (weapon.volley > 1)
    		{
    		if (weapon.volley <= weapon.clip_ammo)
    			{
    			delete options[2].disabled;
    			}
    		}
    		
    	populateListOptions({elemSelector: ".firing-mode-select, .firing-mode-selectBlank",
            				 optionsArray: options});
	    }
	    else
	    {
	    delete options[3].disabled;
	    delete options[0].selected;
	    options[3].selected = true;
	    var values = await getAttrsAsync(["repeating_melees_" + id + "_melee_name"]);
	    await setAttrsAsync({"firing_text": "Strike with " + values["repeating_melees_" + id + "_melee_name"],
    					  	 "shoot_prompt_hider": 0,
    					  	 "shoot_hider": 0});
    					  	 
	    populateListOptions({elemSelector: ".firing-mode-select, .firing-mode-selectBlank",
            				 optionsArray: options});
	    }
	}
	
//=========================================================================
	
function padNumber(number)
    {
    if (number >= 10)
        {
        return "" + number;
        }
        else
        {
        return "0" + number;
        }
    }
	
//=======================================================================

on ("clicked:buy_hp", buyHp);

async function buyHp()
	{
	var values = await getAttrsAsync(["bought_hp", "sta", "xp"], buyHp);
    
	await setAttrsAsync({"hp_prompt_hider": 1});
	
	var boughtHp = parseInt(values.bought_hp);
	var stamina = parseInt(values.sta);
	var xp = parseInt(values.xp);
	
	if (boughtHp < stamina && xp >= 50)
		{
		await setAttrsAsync({"bought_hp": boughtHp + 1});
		}
	}
	
on ("clicked:hp_up", openHpPrompt);
	
async function openHpPrompt()
	{
	console.log("Opening hp prompt");
	var values = await getAttrsAsync(["bought_hp", "sta", "xp"], openHpPrompt);
	
	await setAttrsAsync({"hp_prompt_hider": 0});
	var boughtHp = parseInt(values.bought_hp);
	var stamina = parseInt(values.sta);
	var xp = parseInt(values.xp);
	
	if (boughtHp < stamina && xp >= 50)
		{
		await setAttrsAsync({"hp_raise_status": "Raise HP by -5- for -50- XP?",
				  "buy_hp_hider": 0});
		}
		else if (boughtHp < stamina)
		{
		await setAttrsAsync({"hp_raise_status": "You do not have enough XP (-50-) to raise your HP.",
				  "buy_hp_hider": 1});
		}
		else
		{
		await setAttrsAsync({"hp_raise_status": "You need to raise your Stamina if you want to keep buying HP.",
				  "buy_hp_hider": 1});
		}
	}
	
on ("clicked:cancel_hp_button", cancelHpPrompt);
	
async function cancelHpPrompt()
	{
	await setAttrsAsync({"hp_prompt_hider": 1});
	}

//===========================================================================
	
on ("clicked:roll_attribute", rollAttribute);

async function rollAttribute()
	{
	var values = await getAttrsAsync([attrToRoll, "attribute_roll_intensity", "attribute_roll_modifier", "modifier"]);
	
	var attributeModifier = parseInt(values.attribute_roll_modifier);
	var hpModifier = parseInt(values.modifier);
	var attrValue = parseInt(values[attrToRoll]);
	var attributeName;
	
	switch (attrToRoll)
		{
		case "str":
			attributeName = "Strength";
		break;
		case "sta":
			attributeName = "Stamina";
		break;
		case "agi":
			attributeName = "Agility";
		break;
		case "per":
			attributeName = "Perception";
		break;
		case "int":
			attributeName = "Intelligence";
		break;
		case "cha":
			attributeName = "Charisma";
		break;
		case "wil":
			attributeName = "Willpower";
		break;
		}
	
	var ams = "";
	var hms = "";
	var as = "";
	
	if (attributeModifier > 0)
		{
		ams = " + " + attributeModifier;
		}
		else if (attributeModifier < 0)
		{
		ams = " " + attributeModifier;
		}
		
	if (hpModifier > 0)
		{
		hms = " + " + hpModifier;
		}
		else if (hpModifier < 0)
		{
		hms = " " + hpModifier;
		}
		
	if (attrValue > -1)
		{
		as = " + " + attrValue;
		}
		else
		{
		as = " " + attrValue;
		}
	var rollString = "&{template:";
	if (values.attribute_roll_intensity == "on")
		{
		rollString += "hi-roll} {{name=@{name}}} {{title=: High intensity " + attributeName + " roll: }} {{roll1=[[1d12" + as + ams + hms + "]]}}";
		}
		else
		{
		rollString += "li-roll} {{name=@{name}}} {{title=: Low intensity " + attributeName + " roll: }} {{roll1=[[abs(1d20 - 1d20)" + as + ams + hms + "]]}}";
		}
		
	rerollString = rollString;
	startRoll(rollString, skillCheckCallback);
	
	await setAttrsAsync({"attribute_roll_prompt_hider": 1});
	}

var attrToRoll;

on ("clicked:cancel_attr_roll", closeAttrRoll);

async function closeAttrRoll()
	{
	await setAttrsAsync({"attribute_roll_prompt_hider": 1});
	}
	
on ("clicked:roll_str clicked:roll_sta clicked:roll_agi clicked:roll_per clicked:roll_int clicked:roll_cha clicked:roll_wil", openAttrRoll);

async function openAttrRoll(info)
	{
	console.log("Opening");
	attrToRoll = info.htmlAttributes.name.substring(9, info.htmlAttributes.name.length);
	var name;
	
	switch(attrToRoll)
		{
		case "str":
			name = "Strength";
		break;
		case "sta":
			name = "Stamina";
		break;
		case "agi":
			name = "Agility";
		break;
		case "per":
			name = "Perception";
		break;
		case "cha":
			name = "Charisma";
		break;
		case "int":
			name = "Intelligence";
		break;
		case "wil":
			name = "Willpower";
		break;
		}
		
	await setAttrsAsync({"attribute_roll_prompt_hider": 0,
			  			 "attribute_roll_title": "Roll " + name});
	}

//=========================================================================
	
on ("clicked:roll_skill_with_str clicked:roll_skill_with_sta clicked:roll_skill_with_agi clicked:roll_skill_with_per clicked:roll_skill_with_int clicked:roll_skill_with_cha clicked:roll_skill_with_wil", makeSkillRoll);
	
var attributeToAdd;

async function makeSkillRoll(info)
	{
	attributeToAdd = info.htmlAttributes.name.substring(20, info.htmlAttributes.name.length);
	
	var values;
	
	if (skillToRoll == "art1" ||
		skillToRoll == "art2" ||
		skillToRoll == "hobby1" ||
		skillToRoll == "hobby2" ||
		skillToRoll == "language1" ||
		skillToRoll == "language2" ||
		skillToRoll == "language3" ||
		skillToRoll == "language4" ||
		skillToRoll == "profession1" ||
		skillToRoll == "profession2")
		{
		values = await getAttrsAsync([attributeToAdd, skillToRoll, skillToRoll + "_name", "skill_roll_intensity", "skill_roll_modifier", "modifier"]);
		}
		else
		{
		values = await getAttrsAsync([attributeToAdd, skillToRoll, "skill_roll_intensity", "skill_roll_modifier", "modifier"]);
		}
	
	var skillName;
	var attributeName;
	var skillModifier = parseInt(values.skill_roll_modifier);
	var hpModifier = parseInt(values.modifier);
	var skillValue = parseInt(values[skillToRoll]);
	var attrValue = parseInt(values[attributeToAdd]);
	
	var sms = "";
	var hms = "";
	var ss = "";
	var as = "";
	
	if (skillModifier > 0)
		{
		sms = " + " + skillModifier;
		}
		else if (skillModifier < 0)
		{
		sms = " " + skillModifier;
		}
		
	if (hpModifier > 0)
		{
		hms = " + " + hpModifier;
		}
		else if (hpModifier < 0)
		{
		hms = " " + hpModifier;
		}
		
	if (skillValue > -1)
		{
		ss = " + " + skillValue;
		}
		else
		{
		ss = " " + skillValue;
		}
		
	if (attrValue > -1)
		{
		as = " + " + attrValue;
		}
		else
		{
		as = " " + attrValue;
		}
	
	skillName = await skillToName(skillToRoll);
		
	switch (attributeToAdd)
		{
		case "str":
			attributeName = "Strength";
		break;
		case "sta":
			attributeName = "Stamina";
		break;
		case "agi":
			attributeName = "Agility";
		break;
		case "per":
			attributeName = "Perception";
		break;
		case "int":
			attributeName = "Intelligence";
		break;
		case "cha":
			attributeName = "Charisma";
		break;
		case "wil":
			attributeName = "Willpower";
		break;
		}
	
	var rollString = "&{template:";
	if (values.skill_roll_intensity == "on")
		{
		rollString += "hi-roll} {{name=@{name}}} {{title=: High intensity " + attributeName + " + " + skillName + " check: }} {{roll1=[[1d12" + as + ss + sms + hms + "]]}}";
		}
		else
		{
		rollString += "li-roll} {{name=@{name}}} {{title=: Low intensity " + attributeName + " + " + skillName + " check: }} {{roll1=[[abs(1d20 - 1d20)" + as + ss + sms + hms + "]]}}";
		}
		
	rerollString = rollString;
	startRoll(rollString, skillCheckCallback);
	
	await setAttrsAsync({"roll_prompt_hider": 1});
	}
	
function skillCheckCallback(results)
	{
	finishRoll(results.rollId);
	}

var skillToRoll;

on ("clicked:roll_bridge_tech clicked:roll_mounted_weaponry clicked:roll_pilot_spacecraft clicked:roll_vehicle_engineering clicked:roll_drive_ground_vehicle clicked:roll_knowledge_corporate clicked:roll_knowledge_planets clicked:roll_pilot_areal_vehicle clicked:roll_knowledge_urban clicked:roll_trade clicked:roll_aim clicked:roll_athletics clicked:roll_endurance clicked:roll_melee clicked:roll_reaction clicked:roll_throw clicked:roll_notice clicked:roll_hack_security clicked:roll_search clicked:roll_sleight_of_hand clicked:roll_sneak clicked:roll_astronomy clicked:roll_computer_science clicked:roll_medicine clicked:roll_natural_sciences clicked:roll_robotics clicked:roll_weapons_engineering clicked:roll_xenobiology clicked:roll_convince clicked:roll_deceive clicked:roll_empathy clicked:roll_intimidate clicked:roll_lead clicked:roll_art1 clicked:roll_art2 clicked:roll_hobby1 clicked:roll_hobby2 clicked:roll_language1 clicked:roll_language2 clicked:roll_language3 clicked:roll_language4 clicked:roll_profession1 clicked:roll_profession2", openRollPrompt);

async function openRollPrompt(info)
	{
	skillToRoll = info.htmlAttributes.name.substring(9, info.htmlAttributes.name.length);
	
	var values = await getAttrsAsync([skillToRoll, skillToRoll + "_training_time"]);
	
	var skillName;
	
	skillName = await skillToName(skillToRoll);
	
	var params = {"roll_prompt_hider": 0,
			  	  "roll_title": "Roll " + skillName};
			  	  
	if (values[skillToRoll + "_training_time"] != "0" &&
	    values[skillToRoll] == 0)
	    {
	    params["skill_roll_hider"] = "1";
	    }
	    else
	    {
	    params["skill_roll_hider"] = "0";
	    }
		
	await setAttrsAsync (params);
	}
	
on ("clicked:cancel_skill_roll", cancelRoll);
	
async function cancelRoll()
	{
	await setAttrsAsync({"roll_prompt_hider": 1});
	}
	
//=====================================================================
	
async function skillToName(skill)
	{
	var values = await getAttrsAsync(["art1_name", "art2_name", "hobby1_name",
	"hobby2_name", "language1_name", "language2_name", "language3_name",
	"language4_name", "profession1_name", "profession2_name"]);
	    
	switch (skill)
		{
		case "bridge_tech":
			return "Bridge Tech";
		break;
		case "mounted_weaponry":
			return "Mounted Weaponry";
		break;
		case "pilot_spacecraft":
			return "Pilot Spacecraft";
		break;
		case "vehicle_engineering":
			return "Vehicle Engineering";
		break;
		case "drive_ground_vehicle":
			return "Drive Ground Vehicle";
		break;
		case "knowledge_corporate":
			return "Knowledge (Corporate)";
		break;
		case "knowledge_planets":
			return "Knowledge (Planets)";
		break;
		case "pilot_areal_vehicle":
			return "Pilot Areal Vehicle";
		break;
		case "knowledge_urban":
			return "Knowledge (Urban)";
		break;
		case "trade":
			return "Trade";
		break;
		case "aim":
			return "Aim";
		break;
		case "athletics":
			return "Athletics";
		break;
		case "endurance":
			return "Endurance";
		break;
		case "melee":
			return "Melee";
		break;
		case "reaction":
			return "Reaction";
		break;
		case "throw":
			return "Throw";
		break;
		case "notice":
			return "Notice";
		break;
		case "hack_security":
			return "Hack Security";
		break;
		case "search":
			return "Search";
		break;
		case "sleight_of_hand":
			return "Sleight of Hand";
		break;
		case "sneak":
			return "Sneak";
		break;
		case "astronomy":
			return "Astronomy";
		break;
		case "computer_science":
			return "Computer Science";
		break;
		case "medicine":
			return "Medicine";
		break;
		case "natural_sciences":
			return "Natural Sciences";
		break;
		case "robotics":
			return "Robotics";
		break;
		case "weapons_engineering":
			return "Weapons Engineering";
		break;
		case "xenobiology":
			return "Xenobiology";
		break;
		case "convince":
			return "Convince";
		break;
		case "deceive":
			return "Deceive";
		break;
		case "empathy":
			return "Empathy";
		break;
		case "intimidate":
			return "Intimidate";
		break;
		case "lead":
			return "Lead";
		break;
		case "art1":
			return values.art1_name;
		break;
		case "art2":
			return values.art2_name;
		break;
		case "hobby1":
			return values.hobby1_name;
		break;
		case "hobby2":
			return values.hobby2_name;
		break;
		case "language1":
			return values.language1_name;
		break;
		case "language2":
			return values.language2_name;
		break;
		case "language3":
			return values.language3_name;
		break;
		case "language4":
			return values.language4_name;
		break;
		case "profession1":
			return values.profession1_name;
		break;
		case "profession2":
			return values.profession2_name;
		break;
		}
		
	return "Bullshit is bullshit";
	}

on ("clicked:edit_bridge_tech clicked:edit_mounted_weaponry clicked:edit_pilot_spacecraft clicked:edit_vehicle_engineering clicked:edit_drive_ground_vehicle clicked:edit_knowledge_corporate clicked:edit_knowledge_planets clicked:edit_pilot_aircraft clicked:edit_knowledge_urban clicked:edit_trade clicked:edit_aim clicked:edit_athletics clicked:edit_endurance clicked:edit_melee clicked:edit_reaction clicked:edit_throw clicked:edit_notice clicked:edit_hack_security clicked:edit_search clicked:edit_sleight_of_hand clicked:edit_sneak clicked:edit_astronomy clicked:edit_computer_science clicked:edit_medicine clicked:edit_natural_sciences clicked:edit_robotics clicked:edit_weapons_engineering clicked:edit_xenobiology clicked:edit_convince clicked:edit_deceive clicked:edit_empathy clicked:edit_intimidate clicked:edit_lead clicked:edit_art1 clicked:edit_art2 clicked:edit_hobby1 clicked:edit_hobby2 clicked:edit_language1 clicked:edit_language2 clicked:edit_language3 clicked:edit_language4 clicked:edit_profession1 clicked:edit_profession2", editSkill);

async function editSkill(info)
	{
	var skillToRaise = info.htmlAttributes.name.substring(9, info.htmlAttributes.name.length);
	
	await setAttrsAsync({"skill_to_change": skillToRaise});
	
	var sInfo = await getSkillInfo(skillToRaise);
	
	if (sInfo.trainingTime != 0 && sInfo.currentValue == 0)
		{
		await setAttrsAsync({"skill_training_time_hider": 0,
				  			 "skill_training_time": "Training time: -" + sInfo.trainingTime + "-",
				  			 "skill_prompt_title":  sInfo.skillName + " -" + sInfo.currentValue + "-",
				  			 "skill_xp": sInfo.skillXp,
				  			 "skill_talent": sInfo.talent});
		}
		else
		{
		await setAttrsAsync({"skill_training_time_hider": 1,
				  			 "skill_prompt_title":  sInfo.skillName + " -" + sInfo.currentValue + "-",
				  			 "skill_xp": sInfo.skillXp,
				  			 "skill_talent": sInfo.talent});
		}
	
	var raiseCost = Math.max(0, (sInfo.currentValue + 1) * (sInfo.difficulty - sInfo.talent) - sInfo.skillXp);
		
	if (sInfo.availableXP >= raiseCost && sInfo.currentValue < 10)
		{
		await setAttrsAsync({"hide_level_skill": 0,
				  			 "skill_level_up_text": "Raise skill (cost: -" + raiseCost + "- XP)?"});
		}
		else if (sInfo.currentValue < 10)
		{
		await setAttrsAsync({"hide_level_skill": 1,
				  			 "skill_level_up_text": "Cost to raise: -" + raiseCost + "- XP"});
		}
		else
		{
		await setAttrsAsync({"hide_level_skill": 1,
				  			 "skill_level_up_text": "This skill is maxed out."});
		}
		
	await setAttrsAsync({"skill_prompt_hider": 0});
		
	/*if (bonus > 0)
	    {
	    await setAttrsAsync({"hide_reduce_skill": 0});
	    }
	    else
	    {
	    await setAttrsAsync({"hide_reduce_skill": 1});
	    }*/
	}
	
async function getSkillInfo(skillToRaise)
    {
	var values;
	var info = {};
	
	var xpInfo = await getXPData();
    console.log(xpInfo);
	
	if (skillToRaise == "art1" ||
		skillToRaise == "art2" ||
		skillToRaise == "hobby1" ||
		skillToRaise == "hobby2" ||
		skillToRaise == "language1" ||
		skillToRaise == "language2" ||
		skillToRaise == "language3" ||
		skillToRaise == "language4" ||
		skillToRaise == "profession1" ||
		skillToRaise == "profession2")
		{
		values = await getAttrsAsync(["skill_prompt_hider", "xp", skillToRaise, skillToRaise+"_XP", skillToRaise+"_training_time", skillToRaise + "_bonus", skillToRaise+"_difficulty",
			  skillToRaise.substring(0, skillToRaise.length - 1)+"_talent", "art1_name", "art2_name", "hobby1_name", "hobby2_name", "language1_name",
			  "language2_name", "language3_name", "language4_name", "profession1_name", "profession2_name"]);
		info.talent = parseInt(values[skillToRaise.substring(0, skillToRaise.length-1) + "_talent"]);
		}
		else
		{
		values = await getAttrsAsync(["skill_prompt_hider", "xp", skillToRaise, skillToRaise+"_XP", skillToRaise+"_training_time", skillToRaise + "_bonus", skillToRaise+"_difficulty",
			  skillToRaise+"_talent"]);
		
		info.talent = parseInt(values[skillToRaise + "_talent"]);
		}
	
	info.currentValue = Number(values[skillToRaise]);
	info.trainingTime = values[skillToRaise + "_training_time"];
	info.skillXp = Number(values[skillToRaise + "_XP"]);
	info.difficulty = Number(values[skillToRaise + "_difficulty"]) - xpInfo.skillDiffOff;
	info.bonus = Number(values[skillToRaise + "_bonus"]);
	info.availableXP = Number(values.xp);
		
	info.skillName = await skillToName(skillToRaise);
	
	console.log(info);
	
	return info;
    }
	
on ("clicked:skill_prompt_ok", closeEditSkill);

async function closeEditSkill()
	{
	await setAttrsAsync({"skill_prompt_hider": 1});
	}
	
on ("clicked:level_skill", raiseSkill);

async function raiseSkill(info)
	{
	var skillToRaise = (await getAttrsAsync(["skill_to_change"])).skill_to_change;
	var values = await getAttrsAsync(["spent_xp"]);
	var sInfo = await getSkillInfo(skillToRaise);
	
	var totalCost = (sInfo.currentValue + 1) * (sInfo.difficulty - sInfo.talent);
	var raiseCost = Math.max(0, totalCost - sInfo.skillXp);
	
	console.log(totalCost + " vs " + raiseCost);

    if (raiseCost <= sInfo.availableXP && sInfo.currentValue < 10)
        {
	    await setAttrsAsync({"spent_xp": parseInt(values.spent_xp) + raiseCost,
			  			 [skillToRaise + "_XP"]: "" + Math.max(0, (sInfo.skillXp - totalCost)),
			  			 "skill_xp": "" + Math.max(0, (sInfo.skillXp - totalCost)),
			  			 [skillToRaise]: (sInfo.currentValue + 1) + "",
	                     [skillToRaise + "_bonus"]: (sInfo.bonus + 1) + "",
	                     "skill_prompt_title": sInfo.skillName + " -" + (sInfo.currentValue + 1) + "-"});
	                     
	    var nextRaiseCost = (sInfo.currentValue + 2) * (sInfo.difficulty - sInfo.talent) - Math.max(0, (sInfo.skillXp - totalCost));
	    if (sInfo.availableXP - nextRaiseCost > 0 && sInfo.currentValue < 9)
	        {
	        await setAttrsAsync({"skill_level_up_text": "Raise skill (cost: -" + Math.max(0, nextRaiseCost) + "- XP)?"});
	        }
	        else if (sInfo.currentValue < 9)
	        {
	        await setAttrsAsync({"skill_level_up_text": "Cost to raise: -" + Math.max(0, nextRaiseCost) + "- XP",
	                             "hide_level_skill": 1});
	        }
	        else
	        {
	        await setAttrsAsync({"skill_level_up_text": "This skill is maxed out.",
	                             "hide_level_skill": 1});
	        }
        }
	}
	
on ("change:skill_xp", setSkillText);
	
async function setSkillText(info)
    {
    if (info.sourceType == "player" &&
        Number(info.newValue) != NaN)
        {
        var skillToRaise = (await getAttrsAsync(["skill_to_change"])).skill_to_change;
        var values = await getAttrsAsync(["spent_xp"]);
	
	    var sInfo = await getSkillInfo(skillToRaise);
	
	    var totalCost = (sInfo.currentValue + 1) * (sInfo.difficulty - sInfo.talent);
	    var raiseCost = Math.max(totalCost - Number(info.newValue), 0);
	    
	    //console.log(currentValue + "-" + talent + "-" + difficulty + "-" + availableXP + "-" + bonus);
	    
	    if (sInfo.availableXP - raiseCost > 0)
	        {
	        await setAttrsAsync({"skill_level_up_text": "Raise skill (cost: -" + raiseCost + "- XP)?",
	                             [skillToRaise + "_XP"]: info.newValue,
	                             "hide_level_skill": "0"});
	        }
	        else
	        {
	        await setAttrsAsync({"skill_level_up_text": "Cost to raise: -" + raiseCost + "- XP",
	                             [skillToRaise + "_XP"]: info.newValue,
	                             "hide_level_skill": "1"});
	        }
        }
    }
	
//=========================================================================
on ("clicked:switch_to_character", openCharacter);
on ("clicked:switch_to_gear", openGear);
on ("clicked:switch_to_notes", openNotes);

async function openCharacter()
	{
	await setAttrsAsync({"character_page_hider": 0,
					     "gear_page_hider": 1,
					     "notes_page_hider": 1});
	}
	
async function openGear()
	{
	await setAttrsAsync({"character_page_hider": 1,
					     "gear_page_hider": 0,
					     "notes_page_hider": 1});
	}
	
async function openNotes()
	{
	await setAttrsAsync({"character_page_hider": 1,
					     "gear_page_hider": 1,
					     "notes_page_hider": 0});
	}

//=========================================================================
on ("clicked:str_up clicked:sta_up clicked:agi_up clicked:per_up clicked:int_up clicked:cha_up clicked:wil_up", raiseAttr);

var attrToRaise;

async function raiseAttr(info)
	{
	var attribute = info.htmlAttributes.name.substring(4, 7);
	attrToRaise = attribute;
	var values = await getAttrsAsync(["cc2_prompt_hider", attribute, attribute + "_cc", "xp", "cc_points"]);
	
	var attrName;
	var attrValue = parseInt(values[attribute]);
	var attrCC = parseInt(values[attribute + "_cc"]);
	
	switch (attribute)
		{
		case "str":
			attrName = "strength";
		break;
		case "sta":
			attrName = "stamina";
		break;
		case "agi":
			attrName = "agility";
		break;
		case "per":
			attrName = "perception";
		break;
		case "int":
			attrName = "intelligence";
		break;
		case "cha":
			attrName = "charisma";
		break;
		case "wil":
			attrName = "willpower";
		break;
		}
			
	if (values.cc2_prompt_hider == "1")
		{
		await setAttrsAsync({"attribute_prompt_hider": 0});
		var xpInfo = await getXPData();
        console.log(xpInfo);
		
		var availableXP = parseInt(values.xp);

		if (availableXP < (attrValue + 1) * xpInfo.attrCost)
			{
			await setAttrsAsync({"attribute_prompt_message": "You need -" + (attrValue + 1) * xpInfo.attrCost + "- XP to raise your " + attrName,
					  			 "increase_attribute_hider": 1});
			}
			else
			{
			await setAttrsAsync({"attribute_prompt_message": "To raise " + attrName + " from -" + attrValue + "- to -" + (attrValue + 1) + "-\nyou need to spend -" + (attrValue + 1) * xpInfo.attrCost + "- XP. Proceed?",
					  			 "increase_attribute_hider": 0});
			}
		}
		else
		{
		var ccPoints = parseInt(values.cc_points);
		
		if (ccPoints >= attrValue + 1)
			{
			await setAttrsAsync({[attribute + "_cc"]: (attrCC + 1),
					  			 "cc_points": (ccPoints - attrValue - 1),
					  			 [attribute]: (attrValue + 1)});
			}
			
		await enableCCComplete();
		}
	}

on ("clicked:str_down clicked:sta_down clicked:agi_down clicked:per_down clicked:int_down clicked:cha_down clicked:wil_down", lowerAttr);

async function lowerAttr(info)
	{
	var attribute = info.htmlAttributes.name.substring(4, 7);
	var values = await getAttrsAsync(["cc_points", attribute, attribute + "_cc"]);
	
	var ccPoints = parseInt(values.cc_points);
	var currentValue = parseInt(values[attribute]);
	var currentCC = parseInt(values[attribute + "_cc"]);
		
	if (currentCC > 0)
		{
		await setAttrsAsync({[attribute + "_cc"]: (currentCC - 1),
				  			 "cc_points": (ccPoints + currentValue),
				  			 [attribute]: (currentValue - 1)});
		await enableCCComplete();
		}
	}

on ("clicked:cancel_attr", cancelAttributePrompt)

async function cancelAttributePrompt()
	{
	await setAttrsAsync({"attribute_prompt_hider": 1});
	}


on ("clicked:increase_attr", acceptAttributePrompt);

async function acceptAttributePrompt()
	{
	var values = await getAttrsAsync([attrToRaise, "xp", "spent_xp"]);
	var currentValue = parseInt(values[attrToRaise]);
	var availableXP = parseInt(values.xp);
	var spentXP = parseInt(values.spent_xp);
	
	var xpInfo = await getXPData();
    console.log(xpInfo);
	
	await setAttrsAsync({"attribute_prompt_hider": 1,
						 [attrToRaise]: (currentValue + 1),
						 "spent_xp": (spentXP + (currentValue + 1) * xpInfo.attrCost)});
	}
	
//======================================================================	
var scienceOptions =
	[
	{label: "Astronomy", value: "astronomy"},
	{label: "Computer Science", value: "computer_science"},
	{label: "Medicine", value: "medicine"},
	{label: "Natural Sciences", value: "natural_sciences"},
	{label: "Robotics", value: "robotics"},
	{label: "Weapons Engineering", value: "weapons_engineering"},
	{label: "Xenobiology", value: "xenobiology"}
	];
	
var attributeOptions =
	[
	{label: "Strength", value: "str"},
	{label: "Stamina", value: "sta"},
	{label: "Agility", value: "agi"},
	{label: "Perception", value: "per"},
	{label: "Intelligence", value: "int"},
	{label: "Charisma", value: "cha"},
	{label: "Willpower", value: "wil"}
	];
	
var customOptions = 
	[
	{label: "ASTRONAUTICS", value: "ASTRONAUTICS", disabled: "true"},
	{label: "Bridge Tech", value: "bridge_tech"},
	{label: "Mounted Weaponry", value: "mounted_weaponry"},
	{label: "Pilot Spacecraft", value: "pilot_spacecraft"},
	{label: "Vehicle Engineering", value: "vehicle_engineering"},
	{label: "CIVILIZATIONAL", value: "CIVILIZATIONAL", disabled: "true"},
	{label: "Drive Ground Vehicle", value: "drive_ground_vehicle"},
	{label: "Knowledge (Corporate)", value: "knowledge_corporate"},
	{label: "Knowledge (Planets)", value: "knowledge_planets"},
	{label: "Pilot Areal Vehicle", value: "pilot_areal_vehicle"},
	{label: "Knowledge (Urban)", value: "knowledge_urban"},
	{label: "Trade", value: "trade"},
	{label: "COMBAT", value: "COMBAT", disabled: "true"},
	{label: "Aim", value: "aim"},
	{label: "Athletics", value: "athletics"},
	{label: "Endurance", value: "endurance"},
	{label: "Melee", value: "melee"},
	{label: "Reaction", value: "reaction"},
	{label: "Throw", value: "throw"},
	{label: "INFILTRATION", value: "INFILTRATION", disabled: "true"},
	{label: "Notice", value: "notice"},
	{label: "Hack Security", value: "hack_security"},
	{label: "Search", value: "search"},
	{label: "Sleight of Hand", value: "sleight_of_hand"},
	{label: "Sneak", value: "sneak"},
	{label: "SCIENCE", value: "SCIENCE", disabled: "true"},
	{label: "Astronomy", value: "astronomy"},
	{label: "Computer Science", value: "computer_science"},
	{label: "Medicine", value: "medicine"},
	{label: "Natural Sciences", value: "natural_sciences"},
	{label: "Robotics", value: "robotics"},
	{label: "Weapons Engineering", value: "weapons_engineering"},
	{label: "Xenobiology", value: "xenobiology"},
	{label: "SOCIAL", value: "SOCIAL", disabled: "true"},
	{label: "Convince", value: "convince"},
	{label: "Deceive", value: "deceive"},
	{label: "Empathy", value: "empathy"},
	{label: "Intimidate", value: "intimidate"},
	{label: "Lead", value: "lead"}
	];

function findIndex(optionArray, value)
	{
	for (var i=0; i<optionArray.length; i++)
		{
		if (optionArray[i].value == value)
			{
			return i;
			}
		}
	}
	
function selectOption(optionArray, value)
    {
    
    for (var i=0; i<optionArray.length; i++)
        {
        if (optionArray[i].value == value)
            {
            optionArray[i].selected = "true";
            }
        }
    }
    
on ("change:science1 change:science2", scienceSelectChanged);

async function scienceSelectChanged()
	{
	await setAttrsAsync({"astronomy": "0",
	                     "computer_science": "0",
	                     "natural_sciences": "0",
	                     "robotics": "0",
	                     "weapons_engineering": "0",
	                     "xenobiology": "0"});
	var values = await getAttrsAsync(["science1", "science2"]);   
	    
	var science1Options = structuredClone(scienceOptions);
	var science2Options = structuredClone(scienceOptions);
	science1Options.splice(findIndex(science1Options, values.science2), 1);
	science2Options.splice(findIndex(science2Options, values.science1), 1);
	selectOption(science1Options, values["science1"]);
	selectOption(science2Options, values["science2"]);
	
	populateListOptions({elemSelector: ".science1-select, .science1-selectBlank", optionsArray: science1Options});
	populateListOptions({elemSelector: ".science2-select, .science2-selectBlank", optionsArray: science2Options});
	
	await setAttrsAsync({[values.science1]: 2,
	                     [values.science2]: 1});
	await setCharacterInfo();
	}
	
on ("change:custom_attr1 change:custom_attr2", attributeSelectChanged);

async function attributeSelectChanged()
	{
	var values = await getAttrsAsync(["custom_attr1", "custom_attr2"]); 
	  
	var attribute1Options = structuredClone(attributeOptions);
	var attribute2Options = structuredClone(attributeOptions);
	attribute1Options.splice(findIndex(attribute1Options, values.custom_attr2), 1);
	attribute2Options.splice(findIndex(attribute2Options, values.custom_attr1), 1);
	
	selectOption(attribute1Options, values.custom_attr1);
	selectOption(attribute2Options, values.custom_attr2);
	
	populateListOptions({elemSelector: ".attribute1-select, .attribute1-selectBlank", optionsArray: attribute1Options});
	populateListOptions({elemSelector: ".attribute2-select, .attribute2-selectBlank", optionsArray: attribute2Options});
	
	await setAttrsAsync({"str_profession": 0,
	                    "sta_profession": 0,
	                    "agi_profession": 0,
	                    "per_profession": 0,
	                    "int_profession": 0,
	                    "cha_profession": 0,
	                    "wil_profession": 0});
	                    
	await setAttrsAsync({[values.custom_attr1+"_profession"]: 1,
	                     [values.custom_attr2+"_profession"]: 1});
	                     
	await setAttributes();
	await setCharacterInfo();
	}

on ("change:custom_skill1 change:custom_skill2 change:custom_skill3 change:custom_skill4 change:custom_skill5", customSkillChanged);

async function customSkillChanged()
	{
	await resetSkills();
	var values = await getAttrsAsync(["custom_skill1", "custom_skill2", "custom_skill3", "custom_skill4", "custom_skill5"]);
	    
	var skill1Options = structuredClone(customOptions);
	var skill2Options = structuredClone(customOptions);
	var skill3Options = structuredClone(customOptions);
	var skill4Options = structuredClone(customOptions);
	var skill5Options = structuredClone(customOptions);
	
	skill1Options.splice(findIndex(skill1Options, values.custom_skill2), 1);
	skill1Options.splice(findIndex(skill1Options, values.custom_skill3), 1);
	skill1Options.splice(findIndex(skill1Options, values.custom_skill4), 1);
	skill1Options.splice(findIndex(skill1Options, values.custom_skill5), 1);
	
	skill2Options.splice(findIndex(skill2Options, values.custom_skill1), 1);
	skill2Options.splice(findIndex(skill2Options, values.custom_skill3), 1);
	skill2Options.splice(findIndex(skill2Options, values.custom_skill4), 1);
	skill2Options.splice(findIndex(skill2Options, values.custom_skill5), 1);
	
	skill3Options.splice(findIndex(skill3Options, values.custom_skill2), 1);
	skill3Options.splice(findIndex(skill3Options, values.custom_skill1), 1);
	skill3Options.splice(findIndex(skill3Options, values.custom_skill4), 1);
	skill3Options.splice(findIndex(skill3Options, values.custom_skill5), 1);
	
	skill4Options.splice(findIndex(skill4Options, values.custom_skill2), 1);
	skill4Options.splice(findIndex(skill4Options, values.custom_skill3), 1);
	skill4Options.splice(findIndex(skill4Options, values.custom_skill1), 1);
	skill4Options.splice(findIndex(skill4Options, values.custom_skill5), 1);
	
	skill5Options.splice(findIndex(skill5Options, values.custom_skill2), 1);
	skill5Options.splice(findIndex(skill5Options, values.custom_skill3), 1);
	skill5Options.splice(findIndex(skill5Options, values.custom_skill4), 1);
	skill5Options.splice(findIndex(skill5Options, values.custom_skill1), 1);
	
	selectOption(skill1Options, values.custom_skill1);
	selectOption(skill2Options, values.custom_skill2);
	selectOption(skill3Options, values.custom_skill3);
	selectOption(skill4Options, values.custom_skill4);
	selectOption(skill5Options, values.custom_skill5);
	
	populateListOptions({elemSelector: ".skill1-select, .skill1-selectBlank", optionsArray: skill1Options});
	populateListOptions({elemSelector: ".skill2-select, .skill2-selectBlank", optionsArray: skill2Options});
	populateListOptions({elemSelector: ".skill3-select, .skill3-selectBlank", optionsArray: skill3Options});
	populateListOptions({elemSelector: ".skill4-select, .skill4-selectBlank", optionsArray: skill4Options});
	populateListOptions({elemSelector: ".skill5-select, .skill5-selectBlank", optionsArray: skill5Options});
	
	await setAttrsAsync({[values.custom_skill1]: 2,
	                     [values.custom_skill2]: 1,
	                     [values.custom_skill3]: 1,
	                     [values.custom_skill4]: 1,
	                     [values.custom_skill5]: 1});
	                     
	await setCharacterInfo();
	}


on ("change:main_engineering", engineeringSelected);

async function engineeringSelected()
    {
    var values = await getAttrsAsync(["main_engineering"]);
    
    console.log(JSON.stringify(values));
    
    await setAttrsAsync({"robotics": 1,
                         "weapons_engineering": 1,
                         "vehicle_engineering": 1});
                         
    await setAttrsAsync({[values.main_engineering]: 2});
    
    await setCharacterInfo();
    }
    
//======================================================================
on ("change:custom_prof_name", setCustomProfName);

async function setCustomProfName(info)
    {
    if (info.sourceType == "player")
        {
        await setAttrsAsync({"profession": info.newValue});
        }
    }
    
async function resetSkills()
    {
    await setAttrsAsync({"bridge_tech": 0,
	                     "mounted_weaponry": 0,
	                     "pilot_spacecraft": 0,
	                     "vehicle_engineering": 0,
	                     "drive_ground_vehicle": 0,
	                     "knowledge_corporate": 0,
	                     "knowledge_planets": 0,
	                     "pilot_aircraft": 0,
	                     "knowledge_urban": 0,
	                     "trade": 0,
	                     "aim": 0,
	                     "athletics": 0,
	                     "endurance": 0,
	                     "reaction": 0,
	                     "melee": 0,
	                     "throw": 0,
	                     "notice": 0,
	                     "hack_security": 0,
	                     "search": 0,
	                     "sleight_of_hand": 0,
	                     "sneak": 0,
	                     "astronomy": 0,
	                     "computer_science": 0,
	                     "medicine": 0,
	                     "natural_sciences": 0,
	                     "robotics": 0,
	                     "weapons_engineering": 0,
	                     "xenobiology": 0,
	                     "convince": 0,
	                     "deceive": 0,
	                     "empathy": 0,
	                     "intimidate": 0,
	                     "lead": 0,
	                     "hobby1": 0,
	                     "hobby1_name": "",
	                     "hobby1_name_disabler": 0});
    }

on ("change:profession_select", setProfession);

async function setProfession()
	{
	await resetAttributePoints();
	
	var values = await getAttrsAsync(["profession_select", "territory_select"]);

    await resetSkills();
	await setAttrsAsync({"str_profession": 0,
						 "sta_profession": 0,
						 "agi_profession": 0,
						 "per_profession": 0,
						 "int_profession": 0,
						 "cha_profession": 0,
						 "wil_profession": 0,
	                     "scientist_options_hider": 1,
	                     "engineer_options_hider": 1,
	                     "custom_options_hider": 1,
	                     "bridge_tech_bonus": 0,
	                     "mounted_weaponry_bonus": 0,
	                     "pilot_spacecraft_bonus": 0,
	                     "vehicle_engineering_bonus": 0,
	                     "drive_ground_vehicle_bonus": 0,
	                     "knowledge_corporate_bonus": 0,
	                     "knowledge_planets_bonus": 0,
	                     "pilot_aircraft_bonus": 0,
	                     "knowledge_urban_bonus": 0,
	                     "trade_bonus": 0,
	                     "aim_bonus": 0,
	                     "athletics_bonus": 0,
	                     "endurance_bonus": 0,
	                     "reaction_bonus": 0,
	                     "melee_bonus": 0,
	                     "throw_bonus": 0,
	                     "notice_bonus": 0,
	                     "hack_security_bonus": 0,
	                     "search_bonus": 0,
	                     "sleight_of_hand_bonus": 0,
	                     "sneak_bonus": 0,
	                     "astronomy_bonus": 0,
	                     "computer_science_bonus": 0,
	                     "medicine_bonus": 0,
	                     "natural_sciences_bonus": 0,
	                     "robotics_bonus": 0,
	                     "weapons_engineering_bonus": 0,
	                     "xenobiology_bonus": 0,
	                     "convince_bonus": 0,
	                     "deceive_bonus": 0,
	                     "empathy_bonus": 0,
	                     "intimidate_bonus": 0,
	                     "lead_bonus": 0,
	                     "hobby1_bonus": 0});
						 
	var bonuses = [];

	switch (values.profession_select)
		{
		case "soldier":
			bonuses = ["agi", "per"];
			await setAttrsAsync({ "aim": 2,
            					  "athletics": 1,
            					  "endurance": 1,
            					  "lead": 1,
            					  "medicine": 1,
            					  "hobby1": 1,
            					  "hobby1_name": "Gambling",
            					  "hobby1_name_disabler": 1,
			                      "profession": "Soldier"});
		break;

		case "law_enforcer":
			bonuses = ["agi", "per"];
			await setAttrsAsync({"notice": 2,
            					  "drive_ground_vehicle": 1,
            					  "aim": 1,
            					  "melee": 1,
            					  "knowledge_urban": 1,
			                      "profession": "Law enforcer"});
		break;

		case "scientist":
			bonuses = ["int", "wil"];
			await setAttrsAsync({"notice": 1,
            					  "knowledge_corporate": 1,
            					  "scientist_options_hider": 0,
            					  "convince": 1,
			                      "profession": "Scientist"});
            					  
            await scienceSelectChanged();
			profession = "Scientist";
		break;

		case "doctor":
			bonuses = ["agi", "int"];
			await setAttrsAsync({"medicine": 2,
            					  "empathy": 1,
            					  "natural_sciences": 1,
            					  "convince": 1,
            					  "notice": 1,
			                      "profession": "Doctor"});
		break;

		case "spy":
			bonuses = ["cha", "per"];
			await setAttrsAsync({"empathy": 2,
            					  "convince": 1,
            					  "deceive": 1,
            					  "notice": 1,
            					  "search": 1,
			                      "profession": "Spy"});
		break;

		case "smuggler":
			bonuses = ["agi", "cha"];
			await setAttrsAsync({"deceive": 2,
            					  "knowledge_planets": 1,
            					  "knowledge_corporate": 1,
            					  "pilot_spacecraft": 1,
            					  "trade": 1,
			                      "profession": "Smuggler"});
		break;

		case "thief":
			bonuses = ["agi", "per"];
			await setAttrsAsync({"sneak": 2,
            					  "hack_security": 1,
            					  "search": 1,
            					  "knowledge_urban": 1,
            					  "sleight_of_hand": 1,
			                      "profession": "Thief"});
		break;

		case "swindler":
			bonuses = ["cha", "per"];
			await setAttrsAsync({"deceive": 2,
            					  "convince": 1,
            					  "empathy": 1,
            					  "knowledge_urban": 1,
            					  "sleight_of_hand": 1,
			                      "profession": "Swindler"});
		break;

		case "pilot":
			bonuses = ["int", "per"];
			await setAttrsAsync({"spacecraft_piloting": 2,
            					  "astronomy": 1,
            					  "vehicle_engineering": 1,
            					  "notice": 1,
            					  "pilot_aircraft": 1,
			                      "profession": "Pilot"});
		break;

		case "engineer":
			bonuses = ["agi", "int"];
			await setAttrsAsync({"computer_science": 1,
			                     "engineer_options_hider": 0,
            					  "natural_sciences": 1,
			                      "profession": "Engineer"});
            					  
            await engineeringSelected();
			profession = "Engineer";
		break;

		case "trader":
			bonuses = ["cha", "int"];
			await setAttrsAsync({"trade": 2,
            					  "empathy": 1,
            					  "notice": 1,
            					  "knowledge_planets": 1,
            					  "knowledge_urban": 1,
			                      "profession": "Trader"});
		break;

		case "astronaut":
			bonuses = ["sta", "int"];
			await setAttrsAsync({"bridge_tech": 2,
            					  "astronomy": 1,
            					  "endurance": 1,
            					  "vehicle_engineering": 1,
            					  "knowledge_planets": 1,
			                      "profession": "Astronaut"});
		break;

		case "socialite":
			bonuses = ["cha", "wil"];
			await setAttrsAsync({"empathy": 2,
            					  "convince": 1,
            					  "lead": 1,
            					  "knowledge_urban": 1,
            					  "deceive": 1,
			                      "profession": "Socialite"});
		break;
		
		case "hacker":
		    bonuses = ["int", "per"];
			await setAttrsAsync({"computer_science": 2,
            					  "knowledge_corporate": 1,
            					  "trade": 1,
            					  "deceive": 1,
            					  "robotics": 1,
			                      "profession": "Hacker"});
		break;

		case "custom":
			profession = "Custom";
			await setAttrsAsync({"custom_options_hider": 0});
			await attributeSelectChanged();
			await customSkillChanged();
		break;
		}
		
	if (bonuses.length > 1)
		{
		await setAttrsAsync({[bonuses[0]+"_profession"]: 1,
							 [bonuses[1]+"_profession"]: 1});
		await setAttributes();
		}
		
	var values2 = await getAttrsAsync(["aim", "melee", "reaction"]);
	if (values.territory_select.toLowerCase() == "tatsuba")
	    {
	    await setAttrsAsync({"aim": (Number(values2.aim) + 2) + "",
	                         "reaction": (Number(values2.reaction) + 1) + "",
	                         "melee": (Number(values2.melee) + 1) + ""});
	    }
		
	setCharacterInfo();
	}

var profession;

on ("change:social_class_select", setSocialClass);

async function setSocialClass()
	{
	await resetAttributePoints();
	await setAttrsAsync({"str_social": 0,
						"sta_social": 0,
						"agi_social": 0,
						"per_social": 0,
						"int_social": 0,
						"cha_social": 0,
						"wil_social": 0});
	var values = await getAttrsAsync(["social_class_select"]);

	var bonuses = [];

	switch (values.social_class_select)
		{
		case "wretch":
			bonuses = ["sta", "wil"];
			await setAttrsAsync({"social_class": "Wretch"});
		break;
		case "middle_class":
			bonuses = ["str", "int"];
			await setAttrsAsync({"social_class": "Middle Class"});
		break;
		case "low_corporate":
			bonuses = ["cha", "agi"];
			await setAttrsAsync({"social_class": "Low Corporate"});
		break;
		}

	await setAttrsAsync({[bonuses[0]+"_social"]: 1,
						 [bonuses[1]+"_social"]: 1});
						 
	await setAttributes();
	setCharacterInfo();
	}

//==========================================================================
on ("change:planet_select", setBirthplace);

async function setBirthplace()
	{
	await resetAttributePoints();
	await setAttrsAsync({"str_planet": 0,
						"sta_planet": 0,
						"agi_planet": 0,
						"per_planet": 0,
						"int_planet": 0,
						"cha_planet": 0,
						"wil_planet": 0});
	var values = await getAttrsAsync(["planet_select"]);
	
	var bonuses = [];

	switch (values.planet_select)
		{
		case "a":
			bonuses = ["per", "cha"];
			await setAttrsAsync({"planet": "Class A"});
		break;
		case "b":
			bonuses = ["agi", "int"];
			await setAttrsAsync({"planet": "Class B"});
		break;
		case "c":
			bonuses = ["per", "agi"];
			await setAttrsAsync({"planet": "Class C"});
		break;
		case "d":
			bonuses = ["str", "sta"];
			await setAttrsAsync({"planet": "Class D"});
		break;
		case "e":
			bonuses = ["str", "wil"];
			await setAttrsAsync({"planet": "Class E"});
		break;
		case "f":
			bonuses = ["int", "wil"];
			await setAttrsAsync({"planet": "Space station"});
		break;
		}

	await setAttrsAsync({[bonuses[0]+"_planet"]: 1,
						 [bonuses[1]+"_planet"]: 1});
						 
	await setAttributes();
	setCharacterInfo();
	}

//=======================================================================
on ("change:hp", setPainFromDamage);

async function setPainFromDamage()
	{
	console.log("HP changed, setting pain.");
	var values = await getAttrsAsync(["hp", "max_hp"]);
	
	if (isInteger(values.hp))
		{
		var hp = parseInt(values.hp);
		var maxHp = parseInt(values.max_hp);
			
		if (hp > maxHp)
			{
			hp = maxHp;
			await setAttrsAsync({"hp": maxHp});
			}
			
		var modGroup = Math.floor((maxHp - hp)/parseFloat(maxHp/5));
		await setAttrsAsync({"pain_from_damage": -2 * modGroup});
		}
	}
	
//========================================================================

on ("sheet:opened", init);
on ("change:sta", setMaxHP);
on ("change:total_xp change:spent_xp change:advantage_xp change:resource_xp change:background_xp", setXP);
on ("change:bought_hp", hpBought);

async function hpBought()
    {
    setXP();
    setMaxHP();
    }

async function init()
	{
	await log("Sheet opened.");
	var values = await getAttrsAsync(["cc1_prompt_hider"]);
	if (values.cc1_prompt_hider == "0")
	    {
	    setTerritory();
	    setBirthplace();
	    setSocialClass();
	    await setAttrsAsync({"cc_bridge_tech_talent": 0,
	                         "cc_mounted_weaponry_talent": 0,
	                         "cc_pilot_spacecraft_talent": 0,
	                         "cc_vehicle_engineering_talent": 0,
	                         "cc_drive_ground_vehicle_talent": 0,
	                         "cc_knowledge_corporate_talent": 0,
	                         "cc_knowledge_planets_talent": 0,
	                         "cc_knowledge_urban_talent": 0,
	                         "cc_pilot_aircraft_talent": 0,
	                         "cc_trade_talent": 0,
	                         "cc_aim_talent": 0,
	                         "cc_athletics_talent": 0,
	                         "cc_endurance_talent": 0,
	                         "cc_melee_talent": 0,
	                         "cc_reaction_talent": 0,
	                         "cc_throw_talent": 0,
	                         "cc_notice_talent": 0,
	                         "cc_hack_security_talent": 0,
	                         "cc_search_talent": 0,
	                         "cc_sleight_of_hand_talent": 0,
	                         "cc_sneak_talent": 0,
	                         "cc_astronomy_talent": 0,
	                         "cc_computer_science_talent": 0,
	                         "cc_medicine_talent": 0,
	                         "cc_natural_sciences_talent": 0,
	                         "cc_robotics_talent": 0,
	                         "cc_weapons_engineering_talent": 0,
	                         "cc_xenobiology_talent": 0,
	                         "cc_convince_talent": 0,
	                         "cc_deceive_talent": 0,
	                         "cc_empathy_talent": 0,
	                         "cc_intimidate_talent": 0,
	                         "cc_lead_talent": 0});
	    }
	}
	
function isInteger(value)
	{
	return Number(value) != NaN;
	}
	
async function setXP()
	{
	console.log("Setting xp.");
	var values = await getAttrsAsync(["total_xp", "spent_xp", "bought_hp", "advantage_xp", "resource_xp", "background_xp"]);
	
	console.log("Values in setXP: " + JSON.stringify(values));
	
	let totalXp = parseInt(values.total_xp);
	let skillXp = parseInt(values.spent_xp);
	let hpXp = parseInt(values.bought_hp) * 50;
	let advantageXp = parseInt(values.advantage_xp);
	let resourceXp = Number(values.resource_xp);
	let backgroundXp = Number(values.background_xp);
	await setAttrsAsync({"xp": totalXp - (skillXp + hpXp + advantageXp + resourceXp + backgroundXp)});
	}
	
async function setMaxHP()
	{
	var values = await getAttrsAsync(["bought_hp", "sta"]);
	
	let ccMode = values.character_creation_mode == "on";
	let bought = parseInt(values.bought_hp);
	let stamina = parseInt(values.sta);

	await setAttrsAsync({"max_hp": (bought * 5 + stamina * 5)});
	if (ccMode)
		{
		await setAttrsAsync({"hp": (bought * 5 + stamina * 5)});
		}
	await log("Hp set");
	}
	
//========================================================================
  
on ("change:territory_select", setTerritory);

async function setTerritory()
	{
	await resetAttributePoints();
	await setProfession();
	await setAttrsAsync({"str_territory": 0,
						"sta_territory": 0,
						"agi_territory": 0,
						"per_territory": 0,
						"int_territory": 0,
						"cha_territory": 0,
						"wil_territory": 0,
						"gavadai_options_hider": 1,
						"gt_options_hider": 1,
						"saturnada_options_hider": 1,
						"zaidong_options_hider": 1});
						
	values = await getAttrsAsync(["territory_select"]);
	
	var territory = values.territory_select;
	
	var bonuses = [];
			
	switch (territory)
		{
		case "gavadai":
			bonuses = ["str", "sta", "wil"];
			await setAttrsAsync({"territory": "Gavadai",
					  "language1_name": "Syndicate English",
					  "language1": 3,
					  "language2_name": "Russian",
					  "language2_name_disabler": 1,
					  "language2": 5,
					  "gavadai_options_hider": 0,
			          "talent": 3});
		break;
		case "gt":
			bonuses = ["int", "per", "wil"];
			await setAttrsAsync({"territory": "GT",
					  "language1_name": "Syndicate English",
					  "language1": 5,
					  "language2_name_disabler": 0,
					  "language2_name": " ",
					  "language2": 0,
					  "gt_options_hider": 0,
			          "talent": 3});
		break;
		case "omkinara":
			bonuses = ["int", "agi", "cha"];
			await setAttrsAsync({"territory": "Omkinara",
					  "language1_name": "Syndicate English",
					  "language1": 5,
					  "language2_name": "Hindi",
					  "language2_name_disabler": 1,
					  "language2": 5,
			          "talent": 5});
		break;
		case "saturnada":
			bonuses = ["sta", "per", "wil"];
			await setAttrsAsync({"territory": "Saturnada",
					  "language1_name": "Syndicate English",
					  "language1": 3,
					  "language2_name": "Spanish",
					  "language2_name_disabler": 1,
					  "language2": 5,
					  "saturnada_options_hider": 0,
			          "talent": 3});
		break;
		case "syndeel":
			bonuses = ["int", "cha", "agi"];
			await setAttrsAsync({"territory": "Syndeel",
					  "language1_name": "Syndicate English",
					  "language1": 5,
					  "language2_name": "Neurocode",
					  "language2_name_disabler": 1,
					  "language2": 5,
			          "talent": 3});
		break;
		case "tatsuba":
			bonuses = ["cha", "per", "str"];
			await setAttrsAsync({"territory": "Tatsuba",
					  "language1_name": "Syndicate English",
					  "language1": 3,
					  "language2_name": "Japanese",
					  "language2_name_disabler": 1,
					  "language2": 5,
			          "talent": 3});
					  
			var tatsubaSkills = await getAttrsAsync(["aim", "melee", "reaction"]);
			await setAttrsAsync({"aim": Number(tatsubaSkills.aim)+2,
								 "melee": Number(tatsubaSkills.melee)+1,
								 "reaction": Number(tatsubaSkills.reaction)+1});
		break;
		case "zaidong":
			bonuses = ["sta", "str", "agi"];
			await setAttrsAsync({"territory": "Zaidong",
					  "language1_name": "Syndicate English",
					  "language1": 3,
					  "language2_name": "Syndicate Chinese",
					  "language2_name_disabler": 1,
					  "language2": 5,
					  "zaidong_options_hider": 0});
		break;
		case "imperial":
			bonuses = ["wil", "per", "agi"];
			await setAttrsAsync({"territory": "Imperial renegade",
					  "language1_name": "Imperial Chinese",
					  "language1": 5,
					  "language2_name_disabler": 0,
					  "language2_name": " ",
					  "language2": 0});
		break;
		case "alliance":
			bonuses = ["int", "cha", "sta"];
			await setAttrsAsync({"territory": "Alliance renegade",
					  "language1_name": "Alliance English",
					  "language1": 5,
					  "language2_name_disabler": 0,
					  "language2_name": " ",
					  "language2": 0});
		break;
		case "pirate":
			bonuses = ["wil", "str", "int"];
			await setAttrsAsync({"territory": "Pirate renegade",
					  "language1_name": "Freedomese",
					  "language1": 5,
					  "language2_name_disabler": 0,
					  "language2_name": " ",
					  "language2": 0});
		break;
		}
	
	await setAttrsAsync({[bonuses[0] + "_territory"]: 1,
						 [bonuses[1] + "_territory"]: 1,
						 [bonuses[2] + "_territory"]: 1});
						 
	if (territory == "gavadai")
		{
		values2 = await getAttrsAsync(["gavadai_attribute1", "gavadai_attribute2"]);
		var ga1 = values2.gavadai_attribute1;
		var ga2 = values2.gavadai_attribute2;
		
		values3 = await getAttrsAsync([ga1+"_territory", ga2+"_territory"]);
		var option_attribute1 = Number(values3[ga1+"_territory"]);
		var option_attribute2 = Number(values3[ga2+"_territory"]);
		
		await setAttrsAsync({[ga1+"_territory"]: option_attribute1 + 1,
							 [ga2+"_territory"]: option_attribute2 + 1});
		}
		
	await setAttributes();
	setCharacterInfo();
	}
	
async function resetAttributePoints()
	{
	var values = await getAttrsAsync(["str_cc", "sta_cc", "agi_cc", "per_cc",
	                                  "int_cc", "cha_cc", "wil_cc"]);
	
	var strBonus = Number(values.str_cc);
	var staBonus = Number(values.sta_cc);
	var agiBonus = Number(values.agi_cc);
	var perBonus = Number(values.per_cc);
	var intBonus = Number(values.int_cc);
	var chaBonus = Number(values.cha_cc);
	var wilBonus = Number(values.wil_cc);
	            
	await setAttributes();
	
	var xpInfo = await getXPData();
    console.log(xpInfo);
	
	await setAttrsAsync({"cc_points": xpInfo.maxAttrPoints,
            			 "str_cc": 0,
            			 "sta_cc": 0,
            			 "agi_cc": 0,
            			 "per_cc": 0,
            			 "cha_cc": 0,
            			 "int_cc": 0,
            			 "wil_cc": 0});
	}
	
//orcsAsync by onyxRing
//https://github.com/onyxring/orcsAsync/blob/master/orcsAsync.js

function isRunningOnServer()
    {
    return self.dispatchEvent == undefined;
    }
    
function setActiveCharacterId(charId)
    {
    var oldAcid=getActiveCharacterId();
    var msg={"id":"0", "type":"setActiveCharacter", "data":charId};
    
    if(isRunningOnServer()==false)
        { //if in a browser, use "dispatchEvent" to process the message
        var ev = new CustomEvent("message");
        ev.data=msg; 
        self.dispatchEvent(ev);
        }
        else
        { //otherwise, use the API (server) message processor, "onmessage"
        self.onmessage({data:msg});
        }
        return oldAcid; //return what the value used to be, so calling code can be a little cleaner 
        }
        
    var _sIn=setInterval;
    setInterval=function(callback, timeout)
        {
        var acid=getActiveCharacterId();
        _sIn(function()
            {
            var prevAcid=setActiveCharacterId(acid);
            callback();
            setActiveCharacterId(prevAcid);
            }, timeout);
        }
    var _sto=setTimeout
    setTimeout=function(callback, timeout){
    var acid=getActiveCharacterId();
    _sto(function()
        {
        var prevAcid=setActiveCharacterId(acid);
        callback();
        setActiveCharacterId(prevAcid);
        }, timeout);
    }
    
function getAttrsAsync(props)
    {
    var acid=getActiveCharacterId(); //save the current activeCharacterID in case it has changed when the promise runs 
    var prevAcid=null;               //local variable defined here, because it needs to be shared across the promise callbacks defined below
    return new Promise((resolve,reject)=>
        {
        prevAcid=setActiveCharacterId(acid);  //in case the activeCharacterId has changed, restore it to what we were expecting and save the current value to restore later
        try
            {
            getAttrs(props,(values)=>{  resolve(values); }); 
            }
            catch
            {
            reject();
            }
        }).finally(()=>
        {
        setActiveCharacterId(prevAcid); //restore activeCharcterId to what it was when the promise first ran
        });
    }
    
//use the same pattern for each of the following...
function setAttrsAsync(propObj, options){
    var acid=getActiveCharacterId(); 
    var prevAcid=null;               
    return new Promise((resolve,reject)=>{
            prevAcid=setActiveCharacterId(acid);  
            try{
                setAttrs(propObj,options,(values)=>{ resolve(values); });
            }
            catch{ reject(); }
    }).finally(()=>{
        setActiveCharacterId(prevAcid); 
    });
}

function getSectionIDsAsync(sectionName){
    var acid = getActiveCharacterId(); 
    var prevAcid=null;               
    return new Promise((resolve,reject)=>{
            prevAcid = setActiveCharacterId(acid);  
            try{
                getSectionIDs(sectionName,(values)=>{ resolve(values); });
            }
            catch{ reject(); }
    }).finally(()=>{
        setActiveCharacterId(prevAcid); 
    });
}
