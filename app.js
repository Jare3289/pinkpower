
        const { useState, useMemo, useEffect } = React;

        // Constants
        const LEVEL_LABEL = { High: "เข้มข้น", Medium: "ปานกลาง", Low: "ทั่วไป" };
        const LEVEL_CLASS = {
            High:   { bg: "lvl-high",   dot: "#9e6078" },
            Medium: { bg: "lvl-med",    dot: "#cca0b1" },
            Low:    { bg: "lvl-low",    dot: "#f6e8ec" },
        };

        // Helper functions
        function shortName(fullname) {
            return fullname.replace(/^(นาย|นางสาว|นาง)/, '').trim().split(' ')[0];
        }

        function getStatsForSchedule(sched, teachersCount, highIndices, medIndices) {
            const stats = Array.from({ length: teachersCount }, () => ({ h: 0, m: 0, l: 0, total: 0 }));
            sched.forEach(week => week.forEach((ti, di) => { 
                if (ti === -1 || ti === undefined || ti === null || ti >= teachersCount) return; 
                if (highIndices.includes(di)) stats[ti].h++; 
                else if (medIndices.includes(di)) stats[ti].m++; 
                else stats[ti].l++; 
                stats[ti].total++; 
            }));
            return stats;
        }

        function runRegenWeek(sched, w, helper) {
            const { 
                teachers, 
                duties, 
                malePool, 
                hIdx, 
                mIdx, 
                lIdx, 
                siriwanIdx, 
                natchananIdx, 
                boonmaIdx, 
                rangsaritIdx,
                phanuwatIdx,
                saranIdx,
                thanapatIdx,
                phongphatcharaIdx,
                ratchanokIdx,
                samapornIdx,
                orachumaIdx,
                traffic1Idx,
                traffic1bIdx,
                traffic2Idx, 
                lanDhamIdx,
                leaveOutIdx,
                quotaHigh,
                quotaMedium,
                quotaLow
            } = helper;
            let temp = [...sched[w]];

            if (w === 0) {
                temp = Array(duties.length).fill(-1);
                const getTeacherIdx = (name) => teachers.findIndex(t => t.fullname.replace(/\s+/g, '') === name.replace(/\s+/g, ''));
                
                const filledSlots = {};
                const assignDuty = (dutyNamePattern, teacherName) => {
                    const tIdx = teacherName ? getTeacherIdx(teacherName) : -1;
                    const matchingDuties = [];
                    duties.forEach((d, idx) => {
                        if (d.name.includes(dutyNamePattern)) {
                            matchingDuties.push(idx);
                        }
                    });
                    
                    if (matchingDuties.length === 0) return;
                    
                    if (filledSlots[dutyNamePattern] === undefined) {
                        filledSlots[dutyNamePattern] = 0;
                    }
                    const slotIndex = filledSlots[dutyNamePattern];
                    if (slotIndex < matchingDuties.length) {
                        const dIdx = matchingDuties[slotIndex];
                        temp[dIdx] = tIdx;
                        filledSlots[dutyNamePattern]++;
                    }
                };

                // 1. ปฏิบัติหน้าที่ประตู
                assignDuty("1.1 ประตู 1 (เช้า)", "นายภาณุวัฒน์ เสือไทย");
                assignDuty("1.1 ประตู 1 (เช้า)", "นางอรชุมา พรหมทับทิม");
                assignDuty("1.1 ประตู 1 (เย็น)", "นางสุทัศษา อินมณี");
                assignDuty("1.1 ประตู 1 (เย็น)", "นางสาวณัฐฤทัย คงไกรฤกษ์");
                
                assignDuty("1.2 ประตู 2 (เช้า)", "นางจิรนันท์ คุ้มไพฑูรย์");
                assignDuty("1.2 ประตู 2 (เช้า)", "นางศมาพร เทียมโคกกรวด");
                assignDuty("1.2 ประตู 2 (เช้า)", "นางสาวพรทิพา กองแพ");
                assignDuty("1.2 ประตู 2 (เย็น)", "นางกุลวดี ม่วงพูล");
                assignDuty("1.2 ประตู 2 (เย็น)", "นางพรรณิภา อนันทสุข");
                assignDuty("1.2 ประตู 2 (เย็น)", "");
                
                assignDuty("1.3 ประตู 3 (เย็น)", "นางสาวเพ็ญณิการ์ ยอดเกิด");
                assignDuty("1.3 ประตู 3 (เย็น)", "นายกฤษณพล บุญล้ำ");
                
                assignDuty("1.4 ประตู 4 (เช้า)", "นางจันทนา คงฤทธิ์");
                assignDuty("1.4 ประตู 4 (เช้า)", "");
                assignDuty("1.4 ประตู 4 (เย็น)", "นางสาวอุไรรัตน์ สันบุญเป็ง");
                
                // 2. โรงอาหาร 1
                assignDuty("โรงอาหาร 1 (เช้า)", "นางขวัญเรือน ซื่อดี");
                assignDuty("โรงอาหาร 1 (กลางวัน)", "นางสาวสุชาดา จินกสิกิจ");
                
                // 3. โรงอาหาร 2
                assignDuty("โรงอาหาร 2 (เช้า)", "นางสาวสันธินี บำรุงสุข");
                assignDuty("โรงอาหาร 2 (กลางวัน)", "นางสาวสุภัค พันมะลี");
                
                // 4. ประจำอาคาร
                assignDuty("อาคาร 1", "นางสาวศิริวรรณ ดินแดง");
                assignDuty("อาคาร 2", "นางสาวณัฎฐณิชา จันทร์พวง");
                assignDuty("อาคาร 3", "นางสาวอภิสรา ยอดแตง");
                assignDuty("อาคาร 4", "นางสาวอังคณา เกตุจันทร์");
                assignDuty("อาคาร 5", "นางสาวกฤษณีนาท เนียมนงค์");
                assignDuty("อาคาร 6", "นางสาวรัชนก เกตแค");
                
                // 5. อนุญาตออกนอก
                assignDuty("อนุญาตออกนอก", "นางสาวสิริรัตน์ นิลวรรณ์");
                
                // 6. ตรวจความเรียบร้อย
                assignDuty("หอประชุม/ตึก 5", "นางสาวมนัสนันท์ สิทธิศักดิ์");
                assignDuty("ข้างตึก 1-4", "นางปณิตา พรรณพัชรา");
                
                // 7. จราจร
                assignDuty("7.1 จราจรป้ายใหม่", "นายบุญมา ม่วงพูล");
                assignDuty("7.1 จราจรป้ายใหม่", "");
                assignDuty("7.2 จราจรป้ายเก่า", "นายศรัณย์ เทพพักทัน");
                
                // 8. มาสาย
                assignDuty("8.1 มาสาย", "นางสาวณัฐนันท์ ลิมสมนึก");
                
                // 9. ลานธรรม
                assignDuty("9.1 ลานธรรม", "นายนัชนันท์ นครคง");

                const newSched = sched.map(week => [...week]);
                newSched[w] = temp;
                return newSched;
            }

            const wl = getStatsForSchedule(sched, teachers.length, hIdx, mIdx);
            const prev = w > 0 ? sched[w - 1] : null;

            // 1. Lan Dham Rule: Natchanan & Siriwan alternate
            const hasLanDhamRule = (lanDhamIdx !== -1 && siriwanIdx !== -1 && natchananIdx !== -1);
            if (hasLanDhamRule) {
                const onSpecialist = (w % 2 === 0) ? natchananIdx : siriwanIdx;
                const offSpecialist = (w % 2 === 0) ? siriwanIdx : natchananIdx;
                
                if (temp[lanDhamIdx] === -1) {
                    temp[lanDhamIdx] = onSpecialist;
                }

                if (!temp.includes(offSpecialist)) {
                    const lowPool = lIdx.filter(di => {
                        const lastDuty = prev ? prev.indexOf(offSpecialist) : -1;
                        return di !== lastDuty;
                    });
                    const shuffledLow = [...lowPool].sort(() => Math.random() - 0.5);
                    let assigned = false;
                    for (let di of shuffledLow) { 
                        if (temp[di] === -1) { 
                            temp[di] = offSpecialist; 
                            assigned = true; 
                            break; 
                        } 
                    }
                    if (!assigned) {
                        const anyNonHigh = [...mIdx, ...lIdx].sort(() => Math.random() - 0.5);
                        for (let di of anyNonHigh) { 
                            if (temp[di] === -1) { 
                                temp[di] = offSpecialist; 
                                break; 
                            } 
                        }
                    }
                }
            }

            // 2. Traffic Lock Rule: Lock Boonma → 7.1 slot1 (traffic1Idx) and Rangsarit → 7.1 slot2 (traffic1bIdx) in rounds 1-5
            if (w < 5) {
                if (boonmaIdx !== -1 && traffic1Idx !== -1 && temp[traffic1Idx] === -1) {
                    temp[traffic1Idx] = boonmaIdx;
                }
                if (rangsaritIdx !== -1 && traffic1bIdx !== -1 && temp[traffic1bIdx] === -1) {
                    temp[traffic1bIdx] = rangsaritIdx;
                }
            }

            // Helper: always exclude inspectors and special-locked teachers from general pools
            const alwaysExcluded = (id, di) => {
                if (id === phanuwatIdx || id === saranIdx || id === boonmaIdx || id === rangsaritIdx) return true;
                if (w >= 1 && id === ratchanokIdx) return true; // นางสาวรัชนก ลาป่วย สัปดาห์ 2-10 (w=1 คือสัปดาห์ 2)
                if (w >= 1 && id === samapornIdx) return true; // นางศมาพร เทียมโคกกรวด รองหัวหน้าคณะสี ไม่ต้องจัดภารงาน ตั้งแต่รอบที่ 2 เป็นต้นไป
                if (id === orachumaIdx && !duties[di].name.includes("อาคาร")) return true; // นางอรชุมา พรหมทับทิม ให้อยู่แต่อาคารเท่านั้น
                if (di === leaveOutIdx && (id === thanapatIdx || id === phongphatcharaIdx)) return true; // ห้าม 2 คนนี้ลงอนุญาตออกนอก
                return false;
            };

            const getDutyTime = (name) => {
                name = name.toLowerCase();
                if (name.includes("เย็น") || name.includes("15.50")) return "evening";
                if (name.includes("กลางวัน") || name.includes("11.15")) return "noon";
                return "morning";
            };

            // 3. High Duties (Prioritize traffic duties to ensure male availability)
            const sortedHighIdx = [...hIdx].sort((a, b) => {
                const aIsTraffic = (a === traffic1Idx || a === traffic1bIdx || a === traffic2Idx);
                const bIsTraffic = (b === traffic1Idx || b === traffic1bIdx || b === traffic2Idx);
                if (aIsTraffic && !bIsTraffic) return -1;
                if (!aIsTraffic && bIsTraffic) return 1;
                return 0;
            });
            
            sortedHighIdx.filter(di => temp[di] === -1 && !(w === 0 && di === 13) && !(w < 5 && (di === traffic1Idx || di === traffic1bIdx))).forEach(di => {
                const targetTime = getDutyTime(duties[di].name);
                let pool = Array.from({length: teachers.length}, (_, i) => i).filter(id => {
                    if (temp.includes(id) || alwaysExcluded(id, di)) return false;
                    if (di === traffic2Idx && !malePool.includes(id)) return false;
                    if (di === traffic2Idx && prev && prev[traffic2Idx] === id) return false;
                    
                    if (prev) {
                        const prevDi = prev.indexOf(id);
                        if (prevDi !== -1) {
                            if (getDutyTime(duties[prevDi].name) === targetTime) return false;
                            if (duties[prevDi].level === 'High') return false;
                        }
                    }
                    return wl[id].h < quotaHigh;
                });
                
                // Fallback 1: Relax Advanced Rules
                if (pool.length === 0) {
                    pool = Array.from({length: teachers.length}, (_, i) => i).filter(id => {
                        if (temp.includes(id) || alwaysExcluded(id, di)) return false;
                        if (di === traffic2Idx && !malePool.includes(id)) return false;
                        if (di === traffic2Idx && prev && prev[traffic2Idx] === id) return false;
                        return wl[id].h < quotaHigh;
                    });
                }
                // Fallback 2: Relax Quota
                if (pool.length === 0) {
                    pool = Array.from({length: teachers.length}, (_, i) => i).filter(id => 
                        !temp.includes(id) && !alwaysExcluded(id, di) &&
                        (di !== traffic2Idx || malePool.includes(id))
                    );
                }
                // Fallback 3: Ultimate Fallback
                if (pool.length === 0) {
                    pool = Array.from({length: teachers.length}, (_, i) => i).filter(id => 
                        !temp.includes(id) && !alwaysExcluded(id, di)
                    );
                }
                // Sort by total workload
                pool.sort((a, b) => wl[a].total - wl[b].total || wl[a].h - wl[b].h || Math.random() - 0.5);
                if (pool.length > 0) temp[di] = pool[0];
            });

            // 4. Medium Duties
            mIdx.filter(di => temp[di] === -1 && !(w === 0 && di === 9)).forEach(di => {
                const targetTime = getDutyTime(duties[di].name);
                let pool = Array.from({length: teachers.length}, (_, i) => i).filter(id => {
                    if (temp.includes(id) || alwaysExcluded(id, di)) return false;
                    if (prev) {
                        const prevDi = prev.indexOf(id);
                        if (prevDi !== -1 && getDutyTime(duties[prevDi].name) === targetTime) return false;
                    }
                    return wl[id].m < quotaMedium;
                });
                // Fallback 1: Relax Time Shift
                if (pool.length === 0) {
                    pool = Array.from({length: teachers.length}, (_, i) => i).filter(id => 
                        !temp.includes(id) && !alwaysExcluded(id, di) && wl[id].m < quotaMedium
                    );
                }
                // Fallback 2: Relax Quota
                if (pool.length === 0) {
                    pool = Array.from({length: teachers.length}, (_, i) => i).filter(id => 
                        !temp.includes(id) && !alwaysExcluded(id, di)
                    );
                }
                pool.sort((a, b) => wl[a].total - wl[b].total || wl[a].m - wl[b].m || Math.random() - 0.5);
                if (pool.length > 0) temp[di] = pool[0];
            });

            // 5. Low Duties
            lIdx.filter(di => temp[di] === -1).forEach(di => {
                const targetTime = getDutyTime(duties[di].name);
                let pool = Array.from({length: teachers.length}, (_, i) => i).filter(id => {
                    if (temp.includes(id) || alwaysExcluded(id, di)) return false;
                    if (prev) {
                        const prevDi = prev.indexOf(id);
                        if (prevDi !== -1 && getDutyTime(duties[prevDi].name) === targetTime) return false;
                    }
                    return true;
                });
                // Fallback
                if (pool.length === 0) {
                    pool = Array.from({length: teachers.length}, (_, i) => i).filter(id => 
                        !temp.includes(id) && !alwaysExcluded(id, di)
                    );
                }
                pool.sort((a, b) => 
                    (prev && prev[di] === a ? 1 : 0) - (prev && prev[di] === b ? 1 : 0) || 
                    wl[a].total - wl[b].total || 
                    wl[a].l - wl[b].l || 
                    Math.random() - 0.5
                );
                if (pool.length > 0) temp[di] = pool[0];
            });

            if (w === 0) {
                temp[9] = -1;
                temp[13] = -1;
            }

            // Post-processing: Ensure no vacant duties for w >= 1
            if (w >= 1) {
                const boonmaIdx    = teachers.findIndex(t => t.fullname.replace(/\s+/g,'') === 'นายบุญมาม่วงพูล');
                const rangsaritIdx = teachers.findIndex(t => t.fullname.replace(/\s+/g,'') === 'นายรังสฤษฏ์คำเอม');
                const availableTeachers = Array.from({length: teachers.length}, (_, i) => i).filter(id => {
                    if (id === phanuwatIdx || id === saranIdx) return false;
                    if (id === ratchanokIdx) return false;
                    if (id === samapornIdx) return false;
                    // นายบุญมา และ นายรังสฤษฏ์ ปฏิบัติเวรเฉพาะรอบ 1-5 ผ่าน traffic lock เท่านั้น
                    if (w >= 5 && id === boonmaIdx)    return false;
                    if (w >= 5 && id === rangsaritIdx) return false;
                    return true;
                });

                // 1. Fill vacant duties with unassigned available teachers
                let vacantDuties = [];
                temp.forEach((tIdx, di) => {
                    if (tIdx === -1) vacantDuties.push(di);
                });

                if (vacantDuties.length > 0) {
                    let unassigned = availableTeachers.filter(id => !temp.includes(id));
                    
                    // Try to assign unassigned teachers to vacant duties
                    for (let di of vacantDuties) {
                        if (unassigned.length === 0) break;
                        
                        // Find a teacher in unassigned who is compatible with di
                        // For Orachuma, she prefers building duties. Others are fine with anything.
                        let teacherIndex = -1;
                        if (duties[di].name.includes("อาคาร")) {
                            // If it's a building duty, prioritize Orachuma if she is unassigned
                            teacherIndex = unassigned.indexOf(orachumaIdx);
                        } else {
                            // If it's not a building duty, try to pick anyone EXCEPT Orachuma
                            teacherIndex = unassigned.findIndex(id => id !== orachumaIdx);
                        }
                        
                        if (teacherIndex === -1) {
                            // Fallback: take the first unassigned teacher
                            teacherIndex = 0;
                        }
                        
                        const selectedTeacher = unassigned[teacherIndex];
                        temp[di] = selectedTeacher;
                        unassigned.splice(teacherIndex, 1);
                    }
                    
                    // If Orachuma is still unassigned or we have vacant duties and need to swap
                    // Let's check if Orachuma is assigned to a non-building duty and we can swap her with someone on a building duty
                    const orachumaCurrentDi = temp.indexOf(orachumaIdx);
                    if (orachumaCurrentDi !== -1 && !duties[orachumaCurrentDi].name.includes("อาคาร")) {
                        // She is assigned to a non-building duty. Let's find a building duty assigned to someone else who is not Orachuma
                        const buildingDi = temp.findIndex((tIdx, di) => tIdx !== -1 && tIdx !== orachumaIdx && duties[di].name.includes("อาคาร"));
                        if (buildingDi !== -1) {
                            // Swap them!
                            const otherTeacher = temp[buildingDi];
                            temp[buildingDi] = orachumaIdx;
                            temp[orachumaCurrentDi] = otherTeacher;
                        }
                    }
                }
                
                // 2. Double check if any vacant duties remain (e.g. if we have more duties than available teachers, which shouldn't happen, but just in case)
                temp.forEach((tIdx, di) => {
                    if (tIdx === -1) {
                        // Find any available teacher with the lowest workload in this week and assign them (double assign)
                        const sortedAvailable = [...availableTeachers].sort((a, b) => {
                            const countA = temp.filter(id => id === a).length;
                            const countB = temp.filter(id => id === b).length;
                            return countA - countB || wl[a].total - wl[b].total || Math.random() - 0.5;
                        });
                        if (sortedAvailable.length > 0) {
                            temp[di] = sortedAvailable[0];
                        }
                    }
                });
            }

            const newSched = sched.map(week => [...week]);
            newSched[w] = temp;
            return newSched;
        }

        // --- Sidebar Component ---
        function Sidebar({ active, setActive, collapsed, setCollapsed, schoolName, academicYear }) {
            const systemItems = [
                { id: "overview", label: "ตารางรวมครู",       icon: "▦" },
                { id: "today",    label: "จุดตรวจเวรประจำวัน", icon: "📍" },
                { id: "duty",     label: "ตารางรายหน้าที่",   icon: "▤" },
                { id: "export",   label: "ส่งออกคำสั่ง Word", icon: "↗" },
                { id: "workload", label: "รายงานภาระงาน",     icon: "◐" },
            ];
            const dataItems = [
                { id: "teachers", label: "รายชื่อคุณครู",       icon: "◇" },
                { id: "duties",   label: "จุดปฏิบัติเวร",       icon: "◆" },
                { id: "settings", label: "ตั้งค่าระบบ",       icon: "⚙" },
            ];
            return (
                <aside className="sidebar">
                    <div className="brand">
                        <div className="brand-info">
                            <div className="brand-mark">
                                <svg viewBox="0 0 32 32" width="24" height="24">
                                    <rect x="0" y="0" width="32" height="32" rx="6" fill="#9e6078" />
                                    <path d="M10 22 V11 h5.5 a3.5 3.5 0 0 1 0 7 H10" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="brand-text">
                                <div className="brand-title">Pink Power</div>
                                <div className="brand-sub">เวรคณะสีชมพู</div>
                            </div>
                        </div>
                        <button className="sidebar-toggle-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"}>
                            {collapsed ? "→" : "←"}
                        </button>
                    </div>

                    <nav className="nav">
                        <div className="nav-section">ระบบจัดเวร</div>
                        {systemItems.map(it => (
                            <button
                                key={it.id}
                                className={"nav-item" + (active === it.id ? " active" : "")}
                                onClick={() => setActive(it.id)}
                                title={collapsed ? it.label : ""}
                            >
                                <span className="nav-icon">{it.icon}</span>
                                <span>{it.label}</span>
                            </button>
                        ))}
                        
                        <div className="nav-section" style={{ marginTop: 14 }}>จัดการข้อมูล</div>
                        {dataItems.map(it => (
                            <button
                                key={it.id}
                                className={"nav-item" + (active === it.id ? " active" : "")}
                                onClick={() => setActive(it.id)}
                                title={collapsed ? it.label : ""}
                            >
                                <span className="nav-icon">{it.icon}</span>
                                <span>{it.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <div className="sf-row" style={{ fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span style={{ maxWidth: '60px' }}>โรงเรียน</span>
                            <span title={schoolName}>{schoolName.substring(0, 10) + (schoolName.length > 10 ? '..' : '')}</span>
                        </div>
                        <div className="sf-row"><span>ปีการศึกษา</span><span>{academicYear}</span></div>
                        <div className="sf-row"><span>DB</span><span>pink_power</span></div>
                    </div>
                </aside>
            );
        }

        // --- Home Menu (Dashboard) Component ---
        function HomeMenu({ setActive }) {
            const menus = [
                { id: "overview", label: "ภาพรวมตารางเวร", desc: "ดูตารางเวรของครูทั้งหมดแยกตามรอบสัปดาห์", icon: "🗓️" },
                { id: "today",    label: "จุดตรวจเวรประจำวัน", desc: "เช็คชื่อการมาปฏิบัติเวรของครูในแต่ละวัน", icon: "📍" },
                { id: "duty",     label: "ตารางรายหน้าที่",   desc: "ดูรายชื่อครูแยกตามจุดปฏิบัติเวรแต่ละจุด", icon: "📋" },
                { id: "export",   label: "ส่งออกไฟล์", desc: "ดาวน์โหลดคำสั่งเวรเป็นไฟล์ Microsoft Word", icon: "📥" },
                { id: "workload", label: "รายงานภาระงาน", desc: "ดูสถิติและจำนวนครั้งการอยู่เวรของครูแต่ละคน", icon: "📊" },
                { id: "teachers", label: "รายชื่อคุณครู", desc: "เพิ่ม/ลด และจัดการข้อมูลคุณครูในระบบ", icon: "👩‍🏫" },
                { id: "duties",   label: "จุดปฏิบัติเวร", desc: "จัดการจุดปฏิบัติเวรและระดับความเข้มข้น", icon: "🏢" },
                { id: "settings", label: "ตั้งค่าระบบ", desc: "ตั้งค่าพื้นฐาน ปีการศึกษา และจัดการฐานข้อมูล", icon: "⚙️" },
            ];

            return (
                <div className="home-grid">
                    {menus.map(m => (
                        <div key={m.id} className="home-card" onClick={() => setActive(m.id)}>
                            <div className="home-card-icon">{m.icon}</div>
                            <h3 className="home-card-title">{m.label}</h3>
                            <p className="home-card-desc">{m.desc}</p>
                        </div>
                    ))}
                </div>
            );
        }

        // --- Header Component ---
        function Header({ active, setActive, onShuffle, syncStatus, schoolName, academicYear }) {
            const status = {
                ok:      { dot: "#10b981", label: "บันทึกข้อมูลเรียบร้อย" },
                pending: { dot: "#f59e0b", label: "กำลังบันทึกข้อมูล..." },
                error:   { dot: "#ef4444", label: "บันทึกล้มเหลว" },
            }[syncStatus] || { dot: "#a88c9a", label: "ตรวจสอบสถานะ..." };

            return (
                <header className="header">
                    <div>
                        <div className="crumbs" style={{ display: 'flex', alignItems: 'center' }}>
                            {active !== "home" && (
                                <button className="btn-back" onClick={() => setActive("home")}>
                                    ⬅️ กลับหน้าหลัก
                                </button>
                            )}
                            <span>ระบบจัดเวร / ปีการศึกษา {academicYear}</span>
                        </div>
                        <h1 className="page-title">ตารางเวร{schoolName}</h1>
                    </div>
                    <div className="header-actions">
                        <div className="sync-pill">
                            <span className={`sync-dot ${syncStatus === 'pending' ? 'pulse' : ''}`} style={{ background: status.dot }}></span>
                            {status.label}
                        </div>
                        <button className="btn btn-ghost" onClick={onShuffle}>
                            <span style={{ marginRight: 6 }}>↻</span> สุ่มใหม่ล่วงหน้าทั้งปี
                        </button>
                    </div>
                </header>
            );
        }

        // --- KPI Cards Component ---
        function KpiCards({ teachers, duties, weekDates }) {
            const males = useMemo(() => teachers.filter(t => t.gender === "M").length, [teachers]);
            const females = useMemo(() => teachers.length - males, [teachers, males]);
            const high = useMemo(() => duties.filter(d => d.level === "High").length, [duties]);
            const med  = useMemo(() => duties.filter(d => d.level === "Medium").length, [duties]);
            const low  = useMemo(() => duties.filter(d => d.level === "Low").length, [duties]);

            const cards = [
                {
                    tag: "ROUNDS", title: "รอบปฏิบัติงาน",
                    big: "10", unit: "รอบ / ปีการศึกษา",
                    meta: [
                        { k: "เริ่ม", v: weekDates[0] ? weekDates[0].split(' ')[0] : "-" }, 
                        { k: "สิ้นสุด", v: weekDates[9] || "-" }
                    ],
                    tone: "pink-1",
                },
                {
                    tag: "TEACHERS", title: "กำลังพล",
                    big: String(teachers.length), unit: "ท่าน",
                    meta: [{ k: "ชาย", v: males + " คน" }, { k: "หญิง", v: females + " คน" }],
                    tone: "pink-2",
                },
                {
                    tag: "DUTIES", title: "ภาระงาน",
                    big: String(duties.length), unit: "หน้าที่",
                    meta: [
                        { k: "เข้มข้น", v: high + " จุด" },
                        { k: "ปานกลาง", v: med + " จุด" },
                        { k: "ทั่วไป", v: low + " จุด" },
                    ],
                    tone: "pink-3",
                },
            ];

            return (
                <div className="kpi-grid">
                    {cards.map((c, i) => (
                        <div key={i} className="kpi-card">
                            <div className="kpi-tag">{c.tag}</div>
                            <div className="kpi-title">{c.title}</div>
                            <div className="kpi-big">
                                <span className="kpi-big-num">{c.big}</span>
                                <span className="kpi-unit">{c.unit}</span>
                            </div>
                            <div className="kpi-meta">
                                {c.meta.map((m, j) => (
                                    <div key={j} className="kpi-meta-row">
                                        <span>{m.k}</span>
                                        <span className="kpi-meta-v">{m.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // --- Tab 1: Overview Grid ---
        function OverviewGrid({ teachers, duties, schedule }) {
            return (
                <div className="card grid-card">
                    <div className="card-head">
                        <div>
                            <div className="card-title">ตารางเวรรายครู × รอบสัปดาห์</div>
                            <div className="card-sub">คอลัมน์ "รายชื่อคุณครู" ตรึงไว้เมื่อเลื่อนซ้าย–ขวา · สีกล่องสะท้อนระดับภาระงาน</div>
                        </div>
                        <div className="legend">
                            <span className="legend-item"><span className="legend-sw lvl-high"></span>เข้มข้น</span>
                            <span className="legend-item"><span className="legend-sw lvl-med"></span>ปานกลาง</span>
                            <span className="legend-item"><span className="legend-sw lvl-low"></span>ทั่วไป</span>
                            <span className="legend-item"><span className="legend-sw lvl-none"></span>ว่าง</span>
                        </div>
                    </div>

                    <div className="grid-scroll">
                        <table className="grid-table">
                            <thead>
                                <tr>
                                    <th className="sticky-col head-name">รายชื่อคุณครู</th>
                                    {Array.from({ length: 10 }, (_, w) => (
                                        <th key={w} className="head-week">
                                            <div className="week-row">
                                                <div style={{ textAlign: "center", width: "100%" }}>
                                                    <div className="week-num">รอบที่ {w + 1}</div>
                                                    <div className="week-sub">สัปดาห์</div>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map((t, idx) => (
                                    <tr key={t.id}>
                                        <td className="sticky-col cell-name">
                                            <div className="t-row">
                                                <div className={"t-avatar " + (t.gender === "M" ? "male" : "female")}>
                                                    {t.fullname.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <div className="t-name">{t.fullname}</div>
                                                    <div className="t-sub">{t.gender === "M" ? "ชาย" : "หญิง"} · #{String(idx + 1).padStart(2, "0")} {t.classroom ? `(${t.classroom})` : ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {Array.from({ length: 10 }, (_, w) => {
                                            const dutyEntry = schedule[w] ? Object.entries(schedule[w]).find(([dIdx, tIdx]) => tIdx === idx) : null;
                                            if (!dutyEntry) {
                                                return <td key={w} className="cell-empty">—</td>;
                                            }
                                            const duty = duties[parseInt(dutyEntry[0])];
                                            if (!duty) return <td key={w} className="cell-empty">—</td>;
                                            const cls = LEVEL_CLASS[duty.level].bg;
                                            return (
                                                <td key={w} className={"cell " + cls}>
                                                    <div className="cell-icon">{duty.icon}</div>
                                                    <div className="cell-text">{duty.name.replace(/^[\d.]+\s*/, "").split('(')[0].trim()}</div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        function DutyGrid({ teachers, duties, schedule }) {
            return (
                <div className="card grid-card">
                    <div className="card-head">
                        <div>
                            <div className="card-title">ตารางหน้าที่ × รอบสัปดาห์</div>
                            <div className="card-sub">คอลัมน์ "รายการหน้าที่" ตรึงไว้เมื่อเลื่อนซ้าย–ขวา</div>
                        </div>
                        <div className="legend">
                            <span className="legend-item"><span className="legend-sw lvl-high"></span>เข้มข้น</span>
                            <span className="legend-item"><span className="legend-sw lvl-med"></span>ปานกลาง</span>
                            <span className="legend-item"><span className="legend-sw lvl-low"></span>ทั่วไป</span>
                        </div>
                    </div>

                    <div className="grid-scroll">
                        <table className="grid-table">
                            <thead>
                                <tr>
                                    <th className="sticky-col head-name">รายการหน้าที่</th>
                                    {Array.from({ length: 10 }, (_, w) => (
                                        <th key={w} className="head-week">
                                            <div className="week-row">
                                                <span className="week-num" style={{textAlign: "center", width: "100%"}}>รอบ {w + 1}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {duties.map((d, di) => (
                                    <tr key={d.id}>
                                        <td className="sticky-col cell-duty">
                                            <div className="d-row">
                                                <div className={"d-icon " + LEVEL_CLASS[d.level].bg}>{d.icon}</div>
                                                <div>
                                                    <div className="d-name">{d.name}</div>
                                                    <div className="d-sub">
                                                        <span className={"chip chip-" + d.level.toLowerCase()}>{LEVEL_LABEL[d.level]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {Array.from({ length: 10 }, (_, w) => {
                                            const tid = schedule[w] ? schedule[w][di] : -1;
                                            if (tid === -1 || tid === undefined || tid === null) {
                                                return <td key={w} className="cell-empty">—</td>;
                                            }
                                            const tch = teachers[tid];
                                            if (!tch) return <td key={w} className="cell-empty">—</td>;
                                            return (
                                                <td key={w} className="cell-name-cell">
                                                    <div className="dn-row">
                                                        <div className={"dn-avatar " + (tch.gender === "M" ? "male" : "female")}>
                                                          {tch.fullname.substring(0, 1)}
                                                        </div>
                                                        <div className="dn-name">{shortName(tch.fullname)}</div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        // --- Tab 3: Export Tab ---
        function ExportTab({ teachers, duties, schedule, onExportWord, weekDates, schoolName }) {
            const [week, setWeek] = useState(0);
            const [dateRange, setDateRange] = useState(weekDates[0] || "");

            useEffect(() => {
                if (weekDates[week]) {
                    setDateRange(weekDates[week]);
                }
            }, [week, weekDates]);

            const rows = useMemo(() => {
                if (!schedule[week]) return [];
                const all = duties.map((d, i) => {
                    const tid = schedule[week][i];
                    const tch = (tid !== -1 && tid !== undefined && tid !== null) ? teachers[tid] : null;
                    return { no: i + 1, duty: d, teacher: tch, origIndex: i };
                });
                if (week === 0) {
                    const filtered = all.filter(r => r.teacher !== null);
                    filtered.forEach((r, idx) => {
                        r.no = idx + 1;
                    });
                    return filtered;
                }
                return all;
            }, [teachers, duties, schedule, week]);

            return (
                <div className="export-grid">
                    <div className="card export-form">
                        <div className="card-head"><div className="card-title">ตั้งค่าการส่งออก</div></div>

                        <div className="form-group">
                            <label className="form-label">รอบสัปดาห์</label>
                            <div className="week-picker">
                                {Array.from({ length: 10 }, (_, w) => (
                                    <button
                                        key={w}
                                        className={"week-chip" + (w === week ? " active" : "")}
                                        onClick={() => setWeek(w)}
                                    >
                                        {w + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">วันและสัปดาห์ปฏิบัติงาน</label>
                            <input className="text-input" value={dateRange} onChange={e => setDateRange(e.target.value)} />
                            <div className="hint">ข้อความนี้จะถูกแทรกในส่วนหัวคำสั่งราชการ</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">รูปแบบเอกสาร</label>
                            <div className="format-stack">
                                <div className="format-row">
                                    <div>
                                        <div className="format-title">คำสั่งโรงเรียน</div>
                                        <div className="format-sub">ฟอนต์ TH Sarabun New 16pt</div>
                                    </div>
                                    <div className="badge-pink">มาตรฐาน</div>
                                </div>
                                <div className="format-row">
                                    <div>
                                        <div className="format-title">ตารางสรุป (Landscape)</div>
                                        <div className="format-sub">สำหรับติดบอร์ดประชาสัมพันธ์</div>
                                    </div>
                                    <button className="ghost-pill" onClick={() => alert("ฟอร์มตารางสรุปกำลังอยู่ในช่วงพัฒนา")}>เลือก</button>
                                </div>
                            </div>
                        </div>

                        <button 
                            className="btn btn-primary btn-full"
                            onClick={() => onExportWord(week, dateRange)}
                        >
                            <span style={{ marginRight: 8 }}>⤓</span> ดาวน์โหลด Word (.doc)
                        </button>
                    </div>

                    <div className="card export-preview">
                        <div className="card-head">
                            <div>
                                <div className="card-title">ตัวอย่างรอบสัปดาห์ที่ {week + 1}</div>
                                <div className="card-sub">{dateRange}</div>
                            </div>
                            <div className="preview-meta">{rows.filter(r => r.teacher).length} รายการที่จัดแล้ว</div>
                        </div>

                        <div className="paper">
                            <div className="paper-head">
                                <div className="paper-school">{schoolName}</div>
                                <div className="paper-title">คำสั่งรอบที่ {week + 1}</div>
                                <div className="paper-sub">เรื่อง แต่งตั้งครูปฏิบัติหน้าที่เวรประจำสัปดาห์</div>
                                <div className="paper-date">{dateRange}</div>
                            </div>
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 50 }}>ลำดับ</th>
                                        <th>รายชื่อคุณครู</th>
                                        <th>ภารกิจหน้าที่</th>
                                        <th style={{ width: 100 }}>ระดับ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(r => (
                                        <tr key={r.no}>
                                            <td className="num">{r.no}</td>
                                            <td style={{ fontWeight: 500 }}>{r.teacher ? r.teacher.fullname : <span style={{ color: '#a88c9a', fontStyle: 'italic', fontWeight: 400 }}>ยังไม่ได้มอบหมาย</span>}</td>
                                            <td>{r.duty.name}</td>
                                            <td>
                                                <span className={"chip chip-" + r.duty.level.toLowerCase()}>
                                                    {LEVEL_LABEL[r.duty.level]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }

        // --- Tab 4: Workload Tab ---
        function WorkloadTab({ teachers, duties, schedule, quotaHigh, quotaMedium, quotaLow }) {
            const highIndices = useMemo(() => duties.map((d, i) => d.level === "High" ? i : -1).filter(i => i !== -1), [duties]);
            const medIndices = useMemo(() => duties.map((d, i) => d.level === "Medium" ? i : -1).filter(i => i !== -1), [duties]);

            const stats = useMemo(() => {
                return getStatsForSchedule(schedule, teachers.length, highIndices, medIndices);
            }, [schedule, teachers, highIndices, medIndices]);

            const avg = useMemo(() => {
                if (!stats.length) return "0.0";
                return (stats.reduce((s, x) => s + x.total, 0) / stats.length).toFixed(1);
            }, [stats]);

            const maxT = useMemo(() => {
                if (!stats.length || !teachers.length) return { teacher: { fullname: "-" }, total: 0 };
                let maxIdx = 0;
                for (let i = 1; i < stats.length; i++) {
                    if (stats[i].total > stats[maxIdx].total) maxIdx = i;
                }
                return { teacher: teachers[maxIdx] || { fullname: "-" }, total: stats[maxIdx].total };
            }, [stats, teachers]);

            const minT = useMemo(() => {
                if (!stats.length || !teachers.length) return { teacher: { fullname: "-" }, total: 0 };
                let minIdx = 0;
                for (let i = 1; i < stats.length; i++) {
                    if (stats[i].total < stats[minIdx].total) minIdx = i;
                }
                return { teacher: teachers[minIdx] || { fullname: "-" }, total: stats[minIdx].total };
            }, [stats, teachers]);

            return (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className="quota-grid">
                        <div className="quota-card lvl-high-soft">
                            <div className="quota-label">เวรเข้มข้น · High</div>
                            <div className="quota-big">{quotaHigh}<span> รอบ/คน</span></div>
                            <div className="quota-sub">โควตาสูงสุดต่อปีการศึกษา</div>
                        </div>
                        <div className="quota-card lvl-med-soft">
                            <div className="quota-label">เวรปานกลาง · Medium</div>
                            <div className="quota-big">{quotaMedium}<span> รอบ/คน</span></div>
                            <div className="quota-sub">โควตาสูงสุดต่อปีการศึกษา</div>
                        </div>
                        <div className="quota-card lvl-low-soft">
                            <div className="quota-label">เวรทั่วไป · Low</div>
                            <div className="quota-big">{quotaLow}<span> รอบ/คน</span></div>
                            <div className="quota-sub">โควตาสูงสุดต่อปีการศึกษา</div>
                        </div>
                        <div className="quota-card lvl-summary">
                            <div className="quota-label">สรุปการกระจายงาน</div>
                            <div className="summary-row"><span>เฉลี่ย</span><b>{avg} รอบ/คน</b></div>
                            <div className="summary-row"><span>สูงสุด</span><b>{maxT.teacher ? shortName(maxT.teacher.fullname) : "-"} · {maxT.total}</b></div>
                            <div className="summary-row"><span>ต่ำสุด</span><b>{minT.teacher ? shortName(minT.teacher.fullname) : "-"} · {minT.total}</b></div>
                        </div>
                    </div>

                    <div className="card" style={{ flex: 1, minHeight: 0 }}>
                        <div className="card-head">
                            <div>
                                <div className="card-title">ภาระงานรายบุคคล</div>
                                <div className="card-sub">แถบแสดงจำนวนเวรที่ได้รับมอบหมายเทียบกับโควตาสูงสุดของแต่ละคน</div>
                            </div>
                            <div className="legend">
                                <span className="legend-item"><span className="legend-sw lvl-high"></span>เข้มข้น</span>
                                <span className="legend-item"><span className="legend-sw lvl-med"></span>ปานกลาง</span>
                                <span className="legend-item"><span className="legend-sw lvl-low"></span>ทั่วไป</span>
                            </div>
                        </div>

                        <div className="workload-list">
                            <div className="workload-header">
                                <div>คุณครู</div>
                                <div className="wl-col">เข้มข้น</div>
                                <div className="wl-col">ปานกลาง</div>
                                <div className="wl-col">ทั่วไป</div>
                                <div className="wl-total">รวม</div>
                            </div>
                            {teachers.map((t, idx) => {
                                const s = stats[idx] || { h: 0, m: 0, l: 0, total: 0 };
                                return (
                                    <div className="workload-row" key={t.id}>
                                        <div className="wl-name">
                                            <div className={"t-avatar sm " + (t.gender === "M" ? "male" : "female")}>
                                                {t.fullname.substring(0, 1)}
                                            </div>
                                            <div>
                                                <div className="t-name">{t.fullname}</div>
                                                <div className="t-sub">{t.gender === "M" ? "ครูชาย" : "ครูหญิง"}</div>
                                            </div>
                                        </div>
                                        <WorkloadBar level="High" value={s.h}    max={quotaHigh} />
                                        <WorkloadBar level="Medium" value={s.m} max={quotaMedium} />
                                        <WorkloadBar level="Low" value={s.l}      max={quotaLow} />
                                        <div className="wl-total">{s.total}<span>/{quotaHigh + quotaMedium + quotaLow}</span></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        function WorkloadBar({ level, value, max }) {
            const pct = Math.min(100, (value / (max || 1)) * 100);
            return (
                <div className="wl-col">
                    <div className={"wl-bar " + (level === 'High' ? 'lvl-high-bar' : level === 'Medium' ? 'lvl-med-bar' : 'lvl-low-bar')}>
                        <div className="wl-bar-fill" style={{ width: pct + "%" }}></div>
                    </div>
                    <div className="wl-num">{value}<span>/{max}</span></div>
                </div>
            );
        }

        // --- Tab 5: Teachers List CRUD ---
        function TeachersList({ teachers, onAdd, onEdit, onDelete, stats }) {
            const [search, setSearch] = useState("");
            const [showForm, setShowForm] = useState(false);
            const [editingId, setEditingId] = useState(null);
            
            // Form state
            const [fullname, setFullname] = useState("");
            const [gender, setGender] = useState("F");
            const [role, setRole] = useState("กรรมการ");
            const [classroom, setClassroom] = useState("");

            const handleEditClick = (t) => {
                setEditingId(t.id);
                setFullname(t.fullname);
                setGender(t.gender);
                setRole(t.role);
                setClassroom(t.classroom || "");
                setShowForm(true);
            };

            const handleCancel = () => {
                setShowForm(false);
                setEditingId(null);
                setFullname("");
                setGender("F");
                setRole("กรรมการ");
                setClassroom("");
            };

            const handleSubmit = (e) => {
                e.preventDefault();
                if (!fullname.trim()) {
                    alert("กรุณากรอกชื่อ-นามสกุล");
                    return;
                }
                const teacherData = { fullname, gender, role, classroom };
                if (editingId) {
                    onEdit(editingId, teacherData);
                } else {
                    onAdd(teacherData);
                }
                handleCancel();
            };

            const filteredTeachers = teachers.filter(t => 
                t.fullname.includes(search) || 
                (t.classroom && t.classroom.includes(search)) ||
                t.role.includes(search)
            );

            return (
                <div className="card grid-card">
                    <div className="card-head">
                        <div>
                            <div className="card-title">รายชื่อคุณครูทั้งหมด ({teachers.length} ท่าน)</div>
                            <div className="card-sub">จัดการข้อมูลกำลังพลสำหรับจัดเวร เพิ่ม แก้ไข หรือลบข้อมูล</div>
                        </div>
                        <button className="btn btn-primary" onClick={() => { handleCancel(); setShowForm(!showForm); }}>
                            {showForm ? "ปิดฟอร์ม" : "＋ เพิ่มคุณครูใหม่"}
                        </button>
                    </div>

                    {showForm && (
                        <div className="editor-panel">
                            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600" }}>
                                {editingId ? "แก้ไขข้อมูลคุณครู" : "เพิ่มคุณครูใหม่"}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="editor-form-grid">
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label className="form-label" style={{ marginBottom: "2px" }}>ชื่อ-นามสกุล</label>
                                        <input className="text-input" value={fullname} onChange={e => setFullname(e.target.value)} placeholder="เช่น นายภาณุวัฒน์ เสือไทย" required />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label className="form-label" style={{ marginBottom: "2px" }}>เพศ</label>
                                        <select className="select-input" value={gender} onChange={e => setGender(e.target.value)}>
                                            <option value="M">ชาย</option>
                                            <option value="F">หญิง</option>
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label className="form-label" style={{ marginBottom: "2px" }}>บทบาทหน้าที่ในสี</label>
                                        <select className="select-input" value={role} onChange={e => setRole(e.target.value)}>
                                            <option value="หัวหน้าคณะสี">หัวหน้าคณะสี</option>
                                            <option value="รองหัวหน้าคณะสี">รองหัวหน้าคณะสี</option>
                                            <option value="เลขานุการคณะสี">เลขานุการคณะสี</option>
                                            <option value="กรรมการ">กรรมการ</option>
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label className="form-label" style={{ marginBottom: "2px" }}>ชั้นเรียน (เช่น ม.3/7)</label>
                                        <input className="text-input" value={classroom} onChange={e => setClassroom(e.target.value)} placeholder="ไม่มี (ใส่ว่างได้)" />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn btn-ghost" onClick={handleCancel}>ยกเลิก</button>
                                    <button type="submit" className="btn btn-primary">บันทึกข้อมูล</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="form-group" style={{ borderBottom: "none", padding: "12px 20px" }}>
                        <div className="search-box-row">
                            <span style={{ color: "var(--ink-3)", fontSize: "14px" }}>🔍</span>
                            <input className="text-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาตามชื่อ, บทบาท หรือห้องเรียน..." />
                        </div>
                    </div>

                    <div className="table-scroller">
                        <table className="mgmt-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "60px" }}>ลำดับ</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th style={{ width: "80px" }}>เพศ</th>
                                    <th>บทบาทหน้าที่</th>
                                    <th>ประจำชั้น</th>
                                    <th style={{ width: "160px" }}>ภาระงาน (H/M/L)</th>
                                    <th style={{ width: "150px", textAlign: "right" }}>การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeachers.map((t, idx) => {
                                    const origIdx = teachers.indexOf(t);
                                    const s = stats[origIdx] || { h: 0, m: 0, l: 0, total: 0 };
                                    return (
                                        <tr key={t.id}>
                                            <td style={{ fontFamily: "JetBrains Mono" }}>#{String(origIdx + 1).padStart(2, "0")}</td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <div className={"dn-avatar " + (t.gender === "M" ? "male" : "female")}>
                                                        {t.fullname.substring(0, 1)}
                                                    </div>
                                                    <span style={{ fontWeight: "500" }}>{t.fullname}</span>
                                                    {t.fullname.includes("ศิริวรรณ") && <span className="badge-pink" style={{ fontSize: "8.5px", background: "#874e64" }}>ลานธรรมคี่</span>}
                                                    {t.fullname.includes("นัชนันท์") && <span className="badge-pink" style={{ fontSize: "8.5px", background: "#874e64" }}>ลานธรรมคู่/เลขา</span>}
                                                    {t.fullname.includes("บุญมา") && <span className="badge-pink" style={{ fontSize: "8.5px", background: "#c53030" }}>จราจร/เกษียณ</span>}
                                                </div>
                                            </td>
                                            <td>{t.gender === "M" ? "ชาย" : "หญิง"}</td>
                                            <td>
                                                <span className={"chip chip-" + (t.role.includes("หัวหน้า") ? "high" : t.role.includes("เลขา") ? "medium" : "low")}>
                                                    {t.role}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: "JetBrains Mono" }}>{t.classroom || "—"}</td>
                                            <td style={{ fontFamily: "JetBrains Mono" }}>
                                                <span style={{ color: "#9e6078", fontWeight: "600" }}>{s.h}</span> / <span style={{ color: "#874e64" }}>{s.m}</span> / <span style={{ color: "#4a3a40" }}>{s.l}</span> ({s.total} รอบ)
                                            </td>
                                            <td className="action-cell">
                                                <button className="ghost-pill" onClick={() => handleEditClick(t)}>แก้ไข</button>
                                                <button className="ghost-pill" style={{ borderColor: "#feb2b2", color: "#c53030" }} onClick={() => onDelete(t.id, t.fullname)}>ลบ</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredTeachers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: "center", color: "var(--ink-4)", padding: "30px" }}>ไม่พบข้อมูลคุณครู</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        // --- Tab 6: Duty Locations CRUD ---
        function DutiesList({ duties, onAdd, onEdit, onDelete }) {
            const [search, setSearch] = useState("");
            const [showForm, setShowForm] = useState(false);
            const [editingId, setEditingId] = useState(null);

            // Form state
            const [name, setName] = useState("");
            const [level, setLevel] = useState("Low");
            const [icon, setIcon] = useState("☀️");

            const handleEditClick = (d) => {
                setEditingId(d.id);
                setName(d.name);
                setLevel(d.level);
                setIcon(d.icon);
                setShowForm(true);
            };

            const handleCancel = () => {
                setShowForm(false);
                setEditingId(null);
                setName("");
                setLevel("Low");
                setIcon("☀️");
            };

            const handleSubmit = (e) => {
                e.preventDefault();
                if (!name.trim()) {
                    alert("กรุณากรอกชื่อจุดปฏิบัติเวร");
                    return;
                }
                const dutyData = { name, level, icon };
                if (editingId) {
                    onEdit(editingId, dutyData);
                } else {
                    onAdd(dutyData);
                }
                handleCancel();
            };

            const filteredDuties = duties.filter(d => 
                d.name.includes(search) || 
                LEVEL_LABEL[d.level].includes(search)
            );

            return (
                <div className="card grid-card">
                    <div className="card-head">
                        <div>
                            <div className="card-title">รายชื่อจุดปฏิบัติเวร ({duties.length} หน้าที่)</div>
                            <div className="card-sub">จัดการภารกิจและจุดปฏิบัติงานเวรประจำสัปดาห์</div>
                        </div>
                        <button className="btn btn-primary" onClick={() => { handleCancel(); setShowForm(!showForm); }}>
                            {showForm ? "ปิดฟอร์ม" : "＋ เพิ่มจุดปฏิบัติเวรใหม่"}
                        </button>
                    </div>

                    {showForm && (
                        <div className="editor-panel">
                            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600" }}>
                                {editingId ? "แก้ไขข้อมูลจุดปฏิบัติเวร" : "เพิ่มจุดปฏิบัติเวรใหม่"}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="editor-form-grid">
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "span 2" }}>
                                        <label className="form-label" style={{ marginBottom: "2px" }}>ชื่อจุดปฏิบัติเวร & ช่วงเวลาปฏิบัติงาน</label>
                                        <input className="text-input" value={name} onChange={e => setName(e.target.value)} placeholder="เช่น 7.1 จราจรป้ายใหม่ (เช้า) ☀️" required />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label className="form-label" style={{ marginBottom: "2px" }}>ระดับความเข้มข้นภาระงาน</label>
                                        <select className="select-input" value={level} onChange={e => setLevel(e.target.value)}>
                                            <option value="High">เข้มข้น (High)</option>
                                            <option value="Medium">ปานกลาง (Medium)</option>
                                            <option value="Low">ทั่วไป (Low)</option>
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label className="form-label" style={{ marginBottom: "2px" }}>ไอคอนอิโมจิ</label>
                                        <select className="select-input" value={icon} onChange={e => setIcon(e.target.value)}>
                                            <option value="☀️">☀️ เช้า</option>
                                            <option value="🌙">🌙 เย็น</option>
                                            <option value="🍽️">🍽️ กลางวัน</option>
                                            <option value="☀️🍽️">☀️🍽️ อาคาร</option>
                                            <option value="🏫">🏫 ตึกเรียน</option>
                                            <option value="👮">👮 จราจร/ความเรียบร้อย</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn btn-ghost" onClick={handleCancel}>ยกเลิก</button>
                                    <button type="submit" className="btn btn-primary">บันทึกข้อมูล</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="form-group" style={{ borderBottom: "none", padding: "12px 20px" }}>
                        <div className="search-box-row">
                            <span style={{ color: "var(--ink-3)", fontSize: "14px" }}>🔍</span>
                            <input className="text-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาจุดปฏิบัติเวร..." />
                        </div>
                    </div>

                    <div className="table-scroller">
                        <table className="mgmt-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>ลำดับ</th>
                                    <th style={{ width: "80px" }}>ไอคอน</th>
                                    <th>ชื่อจุดปฏิบัติเวร & ช่วงเวลา</th>
                                    <th>ระดับความเข้มข้น</th>
                                    <th style={{ width: "150px", textAlign: "right" }}>การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDuties.map((d, idx) => {
                                    const origIdx = duties.indexOf(d);
                                    return (
                                        <tr key={d.id}>
                                            <td style={{ fontFamily: "JetBrains Mono" }}>#{String(origIdx + 1).padStart(2, "0")}</td>
                                            <td style={{ fontSize: "16px" }}>{d.icon}</td>
                                            <td style={{ fontWeight: "500" }}>{d.name}</td>
                                            <td>
                                                <span className={"chip chip-" + d.level.toLowerCase()}>
                                                    {LEVEL_LABEL[d.level]}
                                                </span>
                                            </td>
                                            <td className="action-cell">
                                                <button className="ghost-pill" onClick={() => handleEditClick(d)}>แก้ไข</button>
                                                <button className="ghost-pill" style={{ borderColor: "#feb2b2", color: "#c53030" }} onClick={() => onDelete(d.id, d.name)}>ลบ</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredDuties.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", color: "var(--ink-4)", padding: "30px" }}>ไม่พบจุดปฏิบัติเวร</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        // --- Tab 7: Settings View ---
        function SettingsView({ 
            schoolName, setSchoolName, 
            academicYear, setAcademicYear,
            quotaHigh, setQuotaHigh,
            quotaMedium, setQuotaMedium,
            quotaLow, setQuotaLow,
            weekDates, setWeekDates,
            onSaveSettings,
            onClearSchedule,
            onResetDB
        }) {
            const [localSchoolName, setLocalSchoolName] = useState(schoolName);
            const [localAcademicYear, setLocalAcademicYear] = useState(academicYear);
            const [localQuotaHigh, setLocalQuotaHigh] = useState(quotaHigh);
            const [localQuotaMedium, setLocalQuotaMedium] = useState(quotaMedium);
            const [localQuotaLow, setLocalQuotaLow] = useState(quotaLow);
            const [localWeekDates, setLocalWeekDates] = useState([...weekDates]);

            const handleWeekDateChange = (idx, value) => {
                const updated = [...localWeekDates];
                updated[idx] = value;
                setLocalWeekDates(updated);
            };

            const handleSubmit = (e) => {
                e.preventDefault();
                onSaveSettings({
                    school_name: localSchoolName,
                    academic_year: localAcademicYear,
                    quota_high: localQuotaHigh,
                    quota_medium: localQuotaMedium,
                    quota_low: localQuotaLow,
                    week_dates: JSON.stringify(localWeekDates)
                });
            };

            return (
                <div className="card" style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
                    <div className="settings-layout">
                        <div className="settings-column">
                            <form onSubmit={handleSubmit}>
                                <div className="settings-section-title">ตั้งค่าทั่วไป & โควตางาน</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                                    <div>
                                        <label className="form-label">ชื่อโรงเรียน</label>
                                        <input className="text-input" value={localSchoolName} onChange={e => setLocalSchoolName(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="form-label">ปีการศึกษา</label>
                                        <input className="text-input" value={localAcademicYear} onChange={e => setLocalAcademicYear(e.target.value)} required />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                                        <div>
                                            <label className="form-label">โควตา High</label>
                                            <input type="number" min="0" max="10" className="text-input" value={localQuotaHigh} onChange={e => setLocalQuotaHigh(parseInt(e.target.value))} required />
                                        </div>
                                        <div>
                                            <label className="form-label">โควตา Medium</label>
                                            <input type="number" min="0" max="10" className="text-input" value={localQuotaMedium} onChange={e => setLocalQuotaMedium(parseInt(e.target.value))} required />
                                        </div>
                                        <div>
                                            <label className="form-label">โควตา Low</label>
                                            <input type="number" min="0" max="10" className="text-input" value={localQuotaLow} onChange={e => setLocalQuotaLow(parseInt(e.target.value))} required />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                                    💾 บันทึกการตั้งค่า
                                </button>
                            </form>

                            <div className="system-card" style={{ marginTop: "20px" }}>
                                <div className="system-card-title">⚠️ ส่วนควบคุมระบบ (Danger Zone)</div>
                                <div className="system-card-sub">การดำเนินการเหล่านี้จะส่งผลกระทบโดยตรงต่อฐานข้อมูล โปรดดำเนินการด้วยความระมัดระวัง</div>
                                <div className="system-btn-group">
                                    <button className="btn btn-danger" onClick={onClearSchedule} style={{ flex: 1, fontSize: "12px", justifyContent: "center" }}>
                                        ล้างตารางเวรทั้งหมด
                                    </button>
                                    <button className="btn btn-danger" onClick={onResetDB} style={{ flex: 1, fontSize: "12px", justifyContent: "center" }}>
                                        รีเซ็ตฐานข้อมูลเริ่มต้น
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="settings-column" style={{ borderLeft: "1px solid var(--line)", paddingLeft: "24px" }}>
                            <div className="settings-section-title">ตั้งค่าวันที่ในรอบสัปดาห์ (10 สัปดาห์)</div>
                            <div className="dates-editor-grid">
                                {localWeekDates.map((d, idx) => (
                                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        <label className="form-label" style={{ fontSize: "9px" }}>รอบสัปดาห์ที่ {idx + 1}</label>
                                        <input className="text-input" style={{ fontSize: "12px", padding: "6px 8px" }} value={d} onChange={e => handleWeekDateChange(idx, e.target.value)} required />
                                    </div>
                                ))}
                            </div>
                            <div className="hint" style={{ marginTop: "10px" }}>* วันที่เหล่านี้จะถูกนำไปใช้ในพรีวิวและดาวน์โหลดเอกสาร Word คำสั่งราชการ</div>
                        </div>
                    </div>
                </div>
            );
        }

        // --- Today Inspection Tab Component ---
        function TodayInspectionTab({ teachers, duties, schedule, weekDates, attendance, onSaveAttendance }) {
            const [selectedWeek, setSelectedWeek] = useState(0);
            const [selectedDay, setSelectedDay] = useState(0);

            // Group duties for the selected week
            const currentSchedule = schedule[selectedWeek] || [];
            
            const morningDuties = [];
            const noonDuties = [];
            const eveningDuties = [];

            duties.forEach((d, idx) => {
                const assignedIdx = currentSchedule[idx];
                const teacher = (assignedIdx !== undefined && assignedIdx !== -1) ? teachers[assignedIdx] : null;
                
                const item = {
                    dutyIdx: idx,
                    duty: d,
                    teacher: teacher,
                };

                const name = d.name.toLowerCase();
                if (name.includes("เย็น") || name.includes("15.50")) {
                    eveningDuties.push(item);
                } else if (name.includes("กลางวัน") || name.includes("11.15")) {
                    noonDuties.push(item);
                } else {
                    // Default to morning
                    morningDuties.push(item);
                }
            });

            const parseWeekDates = (dateStr) => {
                const daysLabel = ["จ.", "อ.", "พ.", "พฤ.", "ศ."];
                const fallback = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
                if (!dateStr) return fallback;
                try {
                    const parts = dateStr.split('-');
                    if (parts.length !== 2) return fallback;
                    
                    const leftParts = parts[0].trim().split(' ');
                    const rightParts = parts[1].trim().split(' ');
                    
                    let startDay = parseInt(leftParts[0]);
                    let startMonth = leftParts.length > 1 ? leftParts[1] : rightParts[1];
                    let endDay = parseInt(rightParts[0]);
                    let endMonth = rightParts[1];
                    
                    const shortMonth = (m) => {
                        const dict = { "มกราคม": "ม.ค.", "กุมภาพันธ์": "ก.พ.", "มีนาคม": "มี.ค.", "เมษายน": "เม.ย.", "พฤษภาคม": "พ.ค.", "มิถุนายน": "มิ.ย.", "กรกฎาคม": "ก.ค.", "สิงหาคม": "ส.ค.", "กันยายน": "ก.ย.", "ตุลาคม": "ต.ค.", "พฤศจิกายน": "พ.ย.", "ธันวาคม": "ธ.ค." };
                        return dict[m] || m;
                    };
                    
                    startMonth = shortMonth(startMonth);
                    endMonth = shortMonth(endMonth);
                    
                    if (startMonth === endMonth) {
                        return [0,1,2,3,4].map(i => `${daysLabel[i]} ${startDay + i} ${startMonth}`);
                    } else {
                        let results = [];
                        for(let i=0; i<5; i++) {
                            let offsetFromEnd = 4 - i;
                            let d, m;
                            if (endDay - offsetFromEnd > 0) {
                                d = endDay - offsetFromEnd;
                                m = endMonth;
                            } else {
                                d = startDay + i;
                                m = startMonth;
                            }
                            results.push(`${daysLabel[i]} ${d} ${m}`);
                        }
                        return results;
                    }
                } catch(e) {
                    return fallback;
                }
            };

            const displayDates = parseWeekDates(weekDates[selectedWeek]);

            const handleToggleAttendance = (dutyIdx, dayIdx, newState, e) => {
                e.stopPropagation();
                
                const currentState = attendance[selectedWeek]?.[dutyIdx]?.[dayIdx];
                const finalState = currentState === newState ? "pending" : newState;

                const newAttendance = { ...attendance };
                if (!newAttendance[selectedWeek]) newAttendance[selectedWeek] = {};
                if (!newAttendance[selectedWeek][dutyIdx]) newAttendance[selectedWeek][dutyIdx] = {};
                newAttendance[selectedWeek][dutyIdx][dayIdx] = finalState;
                onSaveAttendance(newAttendance);
            };

            const renderCard = (item, i) => {
                const status = attendance[selectedWeek]?.[item.dutyIdx]?.[selectedDay] || "pending";
                
                let cardClass = "duty-card ";
                if (status === "absent") cardClass += "card-absent";
                else if (status === "leave") cardClass += "card-leave";

                return (
                    <div key={i} className={cardClass}>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px"}}>
                            <div className="duty-card-title" style={{marginBottom: 0}}>{item.duty.name}</div>
                        </div>
                        <div className="duty-card-teacher">
                            {item.teacher ? (
                                <>
                                    <span style={{ fontSize: "20px" }}>{item.teacher.gender === 'M' ? '👨‍🏫' : '👩‍🏫'}</span>
                                    <span style={{ fontWeight: "bold" }}>{item.teacher.fullname}</span>
                                </>
                            ) : (
                                <span style={{ color: "var(--text-light)" }}>ยังไม่ได้จัดเวร</span>
                            )}
                        </div>
                        <div className="attendance-actions">
                            <button className={`btn-attendance-action ${status === 'present' ? 'active-present' : ''}`} onClick={(e) => handleToggleAttendance(item.dutyIdx, selectedDay, 'present', e)}>
                                ✅ มา
                            </button>
                            <button className={`btn-attendance-action ${status === 'absent' ? 'active-absent' : ''}`} onClick={(e) => handleToggleAttendance(item.dutyIdx, selectedDay, 'absent', e)}>
                                ❌ ไม่มา
                            </button>
                            <button className={`btn-attendance-action ${status === 'leave' ? 'active-leave' : ''}`} onClick={(e) => handleToggleAttendance(item.dutyIdx, selectedDay, 'leave', e)}>
                                ⚠️ ลา
                            </button>
                        </div>
                    </div>
                );
            };

            const renderSection = (dutiesList, headerClass, headerTitle) => {
                if (dutiesList.length === 0) return null;
                return (
                    <div className="inspection-section">
                        <div className={`inspection-header ${headerClass}`}>{headerTitle}</div>
                        <div className="inspection-grid">
                            {dutiesList.map(renderCard)}
                        </div>
                    </div>
                );
            };

            return (
                <div className="card" style={{ padding: "20px", marginBottom: "0", border: "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ margin: 0, fontSize: "20px" }}>📍 จุดตรวจเวรประจำวัน</h2>
                            <select 
                                className="select-input" 
                                style={{ width: "250px", padding: "8px 12px", fontSize: "14px", fontWeight: "600" }}
                                value={selectedWeek} 
                                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                            >
                                {weekDates.map((d, i) => (
                                    <option key={i} value={i}>รอบที่ {i + 1}: {d}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Day Selector */}
                        <div className="day-selector">
                            {displayDates.map((dateStr, i) => (
                                <button 
                                    key={i} 
                                    className={`day-tab ${selectedDay === i ? 'active' : ''}`}
                                    onClick={() => setSelectedDay(i)}
                                >
                                    {dateStr}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="inspection-sections">
                        {renderSection(morningDuties, "morning-header", "🌅 เวรช่วงเช้า (ก่อนเข้าเรียน)")}
                        {renderSection(noonDuties, "noon-header", "☀️ เวรช่วงกลางวัน (พักรับประทานอาหาร)")}
                        {renderSection(eveningDuties, "evening-header", "🌇 เวรช่วงเย็น (หลังเลิกเรียน)")}
                    </div>
                </div>
            );
        }

        // --- Main App Component ---
        function App() {
            const [teachers, setTeachers] = useState([]);
            const [duties, setDuties] = useState([]);
            const [masterSchedule, setMasterSchedule] = useState([]);
            const [active, setActive] = useState("home");
            const [syncStatus, setSyncStatus] = useState("loading");
            const [isDirty, setIsDirty] = useState(false);
            const [loading, setLoading] = useState(true);
            const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

            // Dynamic settings
            const [schoolName, setSchoolName] = useState("โรงเรียนสาธิตคณะสีชมพู");
            const [academicYear, setAcademicYear] = useState("2568");
            const [quotaHigh, setQuotaHigh] = useState(4);
            const [quotaMedium, setQuotaMedium] = useState(3);
            const [quotaLow, setQuotaLow] = useState(3);
            const [weekDates, setWeekDates] = useState([
                "11-15 พฤษภาคม 2569", 
                "8-12 มิถุนายน 2569", 
                "6-10 กรกฎาคม 2569", 
                "3-7 สิงหาคม 2569", 
                "31 สิงหาคม - 4 กันยายน 2569", 
                "28 กันยายน - 2 ตุลาคม 2569", 
                "26-30 ตุลาคม 2569", 
                "23-27 พฤศจิกายน 2569", 
                "21-25 ธันวาคม 2569", 
                "18-22 มกราคม 2570"
            ]);
            const [attendance, setAttendance] = useState({});

            // Calculate helper indices once data is loaded
            const helperData = useMemo(() => {
                if (!teachers.length || !duties.length) return null;
                const fNames = teachers.map(t => t.fullname);
                
                const mPool = [];
                teachers.forEach((t, idx) => {
                    if (t.gender === 'M') mPool.push(idx);
                });
                
                const high = [];
                const med = [];
                const low = [];
                duties.forEach((d, idx) => {
                    if (d.level === 'High') high.push(idx);
                    else if (d.level === 'Medium') med.push(idx);
                    else if (d.level === 'Low') low.push(idx);
                });

                const siriwan = fNames.findIndex(n => n.includes("ศิริวรรณ"));
                const natchanan = fNames.findIndex(n => n.includes("นัชนันท์"));
                const boonma = fNames.findIndex(n => n.includes("บุญมา"));
                const rangsarit = fNames.findIndex(n => n.includes("รังสฤษฏ์"));
                const phanuwat = fNames.findIndex(n => n.includes("ภาณุวัฒน์"));
                const saran = fNames.findIndex(n => n.includes("ศรัณย์"));
                const samaporn = fNames.findIndex(n => n.includes("ศมาพร"));
                const orachuma = fNames.findIndex(n => n.includes("อรชุมา"));
                const traffic1 = duties.findIndex(d => d.name.includes("7.1"));
                const traffic1b = duties.findIndex((d, idx) => d.name.includes("7.1") && idx > traffic1);
                const traffic2 = duties.findIndex(d => d.name.includes("7.2"));
                const lanDham = duties.findIndex(d => d.name.includes("9.1"));

                return {
                    teachers,
                    duties,
                    dutiesCount: duties.length,
                    teachersCount: teachers.length,
                    malePool: mPool,
                    hIdx: high,
                    mIdx: med,
                    lIdx: low,
                    siriwanIdx: siriwan,
                    natchananIdx: natchanan,
                    boonmaIdx: boonma,
                    rangsaritIdx: rangsarit,
                    phanuwatIdx: phanuwat,
                    saranIdx: saran,
                    samapornIdx: samaporn,
                    orachumaIdx: orachuma,
                    traffic1Idx: traffic1,
                    traffic1bIdx: traffic1b,
                    traffic2Idx: traffic2,
                    lanDhamIdx: lanDham,
                    quotaHigh,
                    quotaMedium,
                    quotaLow
                };
            }, [teachers, duties, quotaHigh, quotaMedium, quotaLow]);

            // Reusable API loading function
            const reloadData = () => {
                setSyncStatus("loading");
                fetch('api.php')
                    .then(res => {
                        if (!res.ok) throw new Error("HTTP status " + res.status);
                        return res.json();
                    })
                    .then(data => {
                        if (!data.success) throw new Error(data.error || "โหลดข้อมูลไม่สำเร็จ");
                        setTeachers(data.teachers);
                        setDuties(data.duties);
                        
                        if (data.settings) {
                            if (data.settings.school_name) setSchoolName(data.settings.school_name);
                            if (data.settings.academic_year) setAcademicYear(data.settings.academic_year);
                            if (data.settings.quota_high) setQuotaHigh(parseInt(data.settings.quota_high));
                            if (data.settings.quota_medium) setQuotaMedium(parseInt(data.settings.quota_medium));
                            if (data.settings.quota_low) setQuotaLow(parseInt(data.settings.quota_low));
                            if (data.settings.week_dates) {
                                try {
                                    setWeekDates(JSON.parse(data.settings.week_dates));
                                } catch (e) { console.error(e); }
                            }
                            if (data.settings.attendance_records) {
                                try {
                                    setAttendance(JSON.parse(data.settings.attendance_records));
                                } catch (e) { console.error(e); }
                            }
                        }

                        if (data.schedule && data.schedule.length > 0) {
                            setMasterSchedule(data.schedule);
                            setIsDirty(false);
                            setSyncStatus("ok");
                        } else {
                            // Load empty or cached
                            const cached = localStorage.getItem('pink_power_final_v1');
                            if (cached) {
                                try {
                                    const parsed = JSON.parse(cached);
                                    if (parsed.length === 10 && parsed[0].length === data.duties.length) {
                                        setMasterSchedule(parsed);
                                        setIsDirty(true);
                                        setSyncStatus("pending");
                                    } else {
                                        generateNewSchedule(data.teachers, data.duties, data.settings);
                                    }
                                } catch (e) {
                                    generateNewSchedule(data.teachers, data.duties, data.settings);
                                }
                            } else {
                                generateNewSchedule(data.teachers, data.duties, data.settings);
                            }
                        }
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error(err);
                        setLoading(false);
                        setSyncStatus("error");
                    });
            };

            // Initial fetch
            useEffect(() => {
                const loader = document.getElementById("fallback-loader");
                if (loader) loader.style.display = "none";
                reloadData();
            }, []);

            const handleSaveAttendance = (newAttendance) => {
                setAttendance(newAttendance);
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'saveSettings',
                        settings: { attendance_records: JSON.stringify(newAttendance) }
                    })
                });
            };

            const generateNewSchedule = (teachersList, dutiesList, settingsData = null, startWeek = 0) => {
                let qHigh = quotaHigh;
                let qMed = quotaMedium;
                let qLow = quotaLow;
                if (settingsData) {
                    if (settingsData.quota_high) qHigh = parseInt(settingsData.quota_high);
                    if (settingsData.quota_medium) qMed = parseInt(settingsData.quota_medium);
                    if (settingsData.quota_low) qLow = parseInt(settingsData.quota_low);
                }

                const fNames = teachersList.map(t => t.fullname);
                const mPool = [];
                teachersList.forEach((t, idx) => {
                    if (t.gender === 'M') mPool.push(idx);
                });
                const high = [];
                const med = [];
                const low = [];
                dutiesList.forEach((d, idx) => {
                    if (d.level === 'High') high.push(idx);
                    else if (d.level === 'Medium') med.push(idx);
                    else if (d.level === 'Low') low.push(idx);
                });

                const siriwan = fNames.findIndex(n => n.includes("ศิริวรรณ"));
                const natchanan = fNames.findIndex(n => n.includes("นัชนันท์"));
                const boonma = fNames.findIndex(n => n.includes("บุญมา"));
                const rangsarit = fNames.findIndex(n => n.includes("รังสฤษฏ์"));
                const phanuwat = fNames.findIndex(n => n.includes("ภาณุวัฒน์"));
                const saran = fNames.findIndex(n => n.includes("ศรัณย์"));
                const thanapat = fNames.findIndex(n => n.includes("ธนพัฒน์"));
                const phongphatchara = fNames.findIndex(n => n.includes("พงษ์พัชรา"));
                const ratchanok = fNames.findIndex(n => n.includes("รัชนก"));
                const samaporn = fNames.findIndex(n => n.includes("ศมาพร"));
                const orachuma = fNames.findIndex(n => n.includes("อรชุมา"));
                
                const traffic1 = dutiesList.findIndex(d => d.name.includes("7.1"));
                const traffic1b = dutiesList.findIndex((d, idx) => d.name.includes("7.1") && idx > traffic1);
                const traffic2 = dutiesList.findIndex(d => d.name.includes("7.2"));
                const lanDham = dutiesList.findIndex(d => d.name.includes("9.1"));
                const leaveOut = dutiesList.findIndex(d => d.name.includes("5. อนุญาตออกนอก"));

                const localHelper = {
                    teachers: teachersList,
                    duties: dutiesList,
                    dutiesCount: dutiesList.length,
                    teachersCount: teachersList.length,
                    malePool: mPool,
                    hIdx: high,
                    mIdx: med,
                    lIdx: low,
                    siriwanIdx: siriwan,
                    natchananIdx: natchanan,
                    boonmaIdx: boonma,
                    rangsaritIdx: rangsarit,
                    phanuwatIdx: phanuwat,
                    saranIdx: saran,
                    thanapatIdx: thanapat,
                    phongphatcharaIdx: phongphatchara,
                    ratchanokIdx: ratchanok,
                    samapornIdx: samaporn,
                    orachumaIdx: orachuma,
                    traffic1Idx: traffic1,
                    traffic1bIdx: traffic1b,
                    traffic2Idx: traffic2,
                    lanDhamIdx: lanDham,
                    leaveOutIdx: leaveOut,
                    quotaHigh: qHigh,
                    quotaMedium: qMed,
                    quotaLow: qLow
                };

                let currentSched = Array.from({ length: 10 }, () => new Array(dutiesList.length).fill(-1));
                
                // Copy existing schedule before startWeek
                if (masterSchedule && masterSchedule.length === 10) {
                    for (let w = 0; w < startWeek; w++) {
                        currentSched[w] = [...masterSchedule[w]];
                    }
                }

                for (let w = startWeek; w < 10; w++) {
                    currentSched = runRegenWeek(currentSched, w, localHelper);
                }
                setMasterSchedule(currentSched);
                setIsDirty(true);
                setSyncStatus("pending");
                
                localStorage.setItem('pink_power_final_v1', JSON.stringify(currentSched));
                autoSave(currentSched);
            };

            const handleShuffleAll = () => {
                let input = prompt("ต้องการเริ่มสุ่มใหม่ตั้งแต่รอบสัปดาห์ที่เท่าไหร่? (1-10)\n*ข้อมูลในสัปดาห์ก่อนหน้าจะถูกล็อกไว้ ไม่เปลี่ยนแปลง", "1");
                if (input !== null) {
                    let startW = parseInt(input) - 1;
                    if (isNaN(startW) || startW < 0 || startW > 9) {
                        alert("กรุณากรอกตัวเลข 1 ถึง 10 เท่านั้น");
                        return;
                    }
                    if (confirm(`ยืนยันการสุ่มตารางเวรใหม่ตั้งแต่รอบที่ ${startW + 1} ถึง 10 ใช่หรือไม่?`)) {
                        generateNewSchedule(teachers, duties, null, startW);
                    }
                }
            };

            const autoSave = (sched) => {
                setSyncStatus("pending");
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'saveData',
                        masterSchedule: sched
                    })
                })
                .then(res => {
                    if (!res.ok) throw new Error("HTTP status " + res.status);
                    return res.json();
                })
                .then(data => {
                    if (data.success) {
                        setIsDirty(false);
                        setSyncStatus("ok");
                    }
                })
                .catch(err => {
                    console.error("Auto-save failed:", err);
                });
            };

            const handleSave = () => {
                setSyncStatus("pending");
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'saveData',
                        masterSchedule: masterSchedule
                    })
                })
                .then(res => {
                    if (!res.ok) throw new Error("HTTP status " + res.status);
                    return res.json();
                })
                .then(data => {
                    if (data.success) {
                        setIsDirty(false);
                        setSyncStatus("ok");
                        alert("บันทึกลงฐานข้อมูลสำเร็จเรียบร้อยแล้ว");
                    } else {
                        throw new Error(data.error || "บันทึกไม่สำเร็จ");
                    }
                })
                .catch(err => {
                    setSyncStatus("error");
                    alert("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
                });
            };

            // CRUD Handlers
            const handleAddTeacher = (newTeacher) => {
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'addTeacher', ...newTeacher })
                })
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        reloadData();
                    } else {
                        alert("ไม่สามารถเพิ่มข้อมูลคุณครูได้: " + resData.error);
                    }
                });
            };

            const handleEditTeacher = (id, updatedTeacher) => {
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'editTeacher', id, ...updatedTeacher })
                })
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        reloadData();
                    } else {
                        alert("ไม่สามารถแก้ไขข้อมูลได้: " + resData.error);
                    }
                });
            };

            const handleDeleteTeacher = (id, name) => {
                if (confirm(`คุณต้องการลบคุณครู "${name}" ออกจากระบบใช่หรือไม่?\n*การลบนี้จะล้างประวัติการปฏิบัติเวรของคุณครูท่านนี้ทั้งหมดในระบบ`)) {
                    fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'deleteTeacher', id })
                    })
                    .then(res => res.json())
                    .then(resData => {
                        if (resData.success) {
                            reloadData();
                        } else {
                            alert("ไม่สามารถลบข้อมูลคุณครูได้: " + resData.error);
                        }
                    });
                }
            };

            const handleAddDuty = (newDuty) => {
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'addDuty', ...newDuty })
                })
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        reloadData();
                    } else {
                        alert("ไม่สามารถเพิ่มข้อมูลจุดเวรได้: " + resData.error);
                    }
                });
            };

            const handleEditDuty = (id, updatedDuty) => {
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'editDuty', id, ...updatedDuty })
                })
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        reloadData();
                    } else {
                        alert("ไม่สามารถแก้ไขข้อมูลได้: " + resData.error);
                    }
                });
            };

            const handleDeleteDuty = (id, name) => {
                if (confirm(`คุณต้องการลบจุดปฏิบัติเวร "${name}" ใช่หรือไม่?\n*การลบนี้จะลบตารางเวรในหน้าที่นี้ออกทั้งหมด`)) {
                    fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'deleteDuty', id })
                    })
                    .then(res => res.json())
                    .then(resData => {
                        if (resData.success) {
                            reloadData();
                        } else {
                            alert("ไม่สามารถลบข้อมูลได้: " + resData.error);
                        }
                    });
                }
            };

            const handleSaveSettings = (settingsData) => {
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'saveSettings', settings: settingsData })
                })
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        setSchoolName(settingsData.school_name);
                        setAcademicYear(settingsData.academic_year);
                        setQuotaHigh(parseInt(settingsData.quota_high));
                        setQuotaMedium(parseInt(settingsData.quota_medium));
                        setQuotaLow(parseInt(settingsData.quota_low));
                        setWeekDates(JSON.parse(settingsData.week_dates));
                        alert("บันทึกการตั้งค่าสำเร็จเรียบร้อยแล้ว");
                        reloadData();
                    } else {
                        alert("ไม่สามารถบันทึกการตั้งค่าได้: " + resData.error);
                    }
                });
            };

            const handleClearSchedule = () => {
                if (confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างตารางเวรทั้งหมด?\n*ข้อมูลการจัดเวรจะหายไปทั้งหมดและสล็อตจะเป็นว่าง")) {
                    const emptySched = Array.from({ length: 10 }, () => new Array(duties.length).fill(-1));
                    fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'saveData', masterSchedule: emptySched })
                    })
                    .then(res => res.json())
                    .then(resData => {
                        if (resData.success) {
                            setMasterSchedule(emptySched);
                            setIsDirty(false);
                            setSyncStatus("ok");
                            localStorage.removeItem('pink_power_final_v1');
                            alert("ล้างตารางเวรสำเร็จเรียบร้อยแล้ว");
                        } else {
                            alert("ไม่สามารถล้างตารางเวรได้: " + resData.error);
                        }
                    });
                }
            };

            const handleResetDB = () => {
                if (confirm("⚠️ คำเตือน! คุณต้องการรีเซ็ตระบบและฐานข้อมูลกลับเป็นค่าเริ่มต้นโรงงานใช่หรือไม่?\n*ข้อมูลคุณครู หน้าที่ และตารางเวรที่แก้ไขไปทั้งหมดจะถูกลบและดึงค่าตั้งต้นกลับมาใหม่")) {
                    fetch('api.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'resetDatabase' })
                    })
                    .then(res => res.json())
                    .then(resData => {
                        if (resData.success) {
                            alert("รีเซ็ตระบบกลับเป็นค่าเริ่มต้นสำเร็จแล้ว!");
                            window.location.reload();
                        } else {
                            alert("ไม่สามารถรีเซ็ตระบบได้: " + resData.error);
                        }
                    });
                }
            };

            // Word Doc Export
            const handleExportWord = (weekIdx, dateStr) => {
                const sc = masterSchedule[weekIdx];
                if (!sc) return;
                
                const n = (i) => {
                    if (sc[i] !== -1 && sc[i] !== undefined && sc[i] !== null) {
                        return teachers[sc[i]] ? teachers[sc[i]].fullname : "..........................................................";
                    }
                    return "..........................................................";
                };

                const isDefaultDuties = (duties.length >= 33 && duties[0].name.includes("ประตู 1"));
                
                let template = "";
                if (isDefaultDuties) {
                    let globalCounters = {};
                    const getNum = (prefix) => {
                        if (!globalCounters[prefix]) globalCounters[prefix] = 1;
                        return globalCounters[prefix]++;
                    };
                    const renderList = (prefix, idxs) => {
                        return idxs.map((i) => {
                            if (i === -1 || sc[i] === -1 || sc[i] === undefined) return '';
                            return `<p class="level-2">${prefix}.${getNum(prefix)} ${n(i)}</p>`;
                        }).join('');
                    };
                    const renderInline = (prefix, idxs) => {
                        return idxs.map((i) => {
                            if (i === -1 || sc[i] === -1 || sc[i] === undefined) return '';
                            return `<p class="level-2">${prefix}.${getNum(prefix)} ${n(i)}</p>`;
                        }).join('');
                    };
                    
                    const getDutyIndices = (pattern) => {
                        const idxs = [];
                        duties.forEach((d, idx) => {
                            if (d.name.includes(pattern)) {
                                idxs.push(idx);
                            }
                        });
                        return idxs;
                    };

                    template = `<style>@font-face { font-family: 'TH Sarabun New'; } p, div, span, td { font-family: 'TH Sarabun New', sans-serif; font-size: 16pt; line-height: 1.15; margin: 0; } .bold { font-weight: bold; } .center { text-align: center; } .level-0 { margin-left: 0pt; } .level-1 { margin-left: 36pt; } .level-2 { margin-left: 72pt; } </style>
<div class="center"><p class="bold" style="font-size: 18pt;">คำสั่งมอบหมายหน้าที่ปฏิบัติเวรคณะสีชมพู</p><p class="bold" style="font-size: 16pt;">ประจำรอบที่ ${weekIdx + 1} ${dateStr}</p></div><br/>
<p class="bold level-0">1. ปฏิบัติหน้าที่ประตู ${dateStr}</p>
<p class="level-1">1.1 ประตู 1 ข้างบ้านพักผู้อำนวยการเขตพื้นที่การศึกษาชัยนาท</p>
<p class="level-1">ช่วงเช้า เวลา 06.30 – 08.00 น.</p>${renderList('1.1', getDutyIndices("1.1 ประตู 1 (เช้า)"))}
<p class="level-1">ช่วงเย็น เวลา 15.50 – 16.30 น.</p>${renderList('1.1', getDutyIndices("1.1 ประตู 1 (เย็น)"))}
<p class="level-1">1.2 ประตู 2 หน้าโรงเรียน</p>
<p class="level-1">ช่วงเช้า เวลา 06.30 – 08.00 น.</p>${renderList('1.2', getDutyIndices("1.2 ประตู 2 (เช้า)"))}
<p class="level-1">ช่วงเย็น เวลา 15.50 – 16.30 น.</p>${renderList('1.2', getDutyIndices("1.2 ประตู 2 (เย็น)"))}
<p class="level-1">1.3 ประตู 3 ข้างห้องกิจกรรมพัฒนาผู้เรียน</p>
<p class="level-1">ช่วงเย็น เวลา 15.50 – 16.30 น.</p>${renderList('1.3', getDutyIndices("1.3 ประตู 3 (เย็น)"))}
<p class="level-1">1.4 ประตู 4 หน้าอาคารศิลปะ</p>
<p class="level-1">ช่วงเช้า เวลา 06.30 – 08.00 น.</p>${renderList('1.4', getDutyIndices("1.4 ประตู 4 (เช้า)"))}
<p class="level-1">ช่วงเย็น เวลา 15.50 – 16.30 น.</p>${renderList('1.4', getDutyIndices("1.4 ประตู 4 (เย็น)"))}

<p class="bold level-0">2. ปฏิบัติหน้าที่ประจำโรงอาหาร 1 (ด้านล่างหอประชุมโรงเรียน) ${dateStr}</p>
<p class="level-1">ช่วงเช้า เวลา 06.30 – 08.00 น.</p>${renderInline('2', getDutyIndices("โรงอาหาร 1 (เช้า)"))}
<p class="level-1">ช่วงกลางวัน เวลา 11.15 – 13.05 น.</p>${renderInline('2', getDutyIndices("โรงอาหาร 1 (กลางวัน)"))}

<p class="bold level-0">3. ปฏิบัติหน้าที่ประจำโรงอาหาร 2 (ด้านหลังอาคาร 6) ${dateStr}</p>
<p class="level-1">ช่วงเช้า เวลา 06.30 – 08.00 น.</p>${renderInline('3', getDutyIndices("โรงอาหาร 2 (เช้า)"))}
<p class="level-1">ช่วงกลางวัน เวลา 11.15 – 13.05 น.</p>${renderInline('3', getDutyIndices("โรงอาหาร 2 (กลางวัน)"))}

<p class="bold level-0">4. ปฏิบัติหน้าที่ประจำอาคาร ${dateStr}</p>
<p class="level-1">อาคาร 1</p>${renderInline('4', getDutyIndices("อาคาร 1"))}
<p class="level-1">อาคาร 2</p>${renderInline('4', getDutyIndices("อาคาร 2"))}
<p class="level-1">อาคาร 3</p>${renderInline('4', getDutyIndices("อาคาร 3"))}
<p class="level-1">อาคาร 4</p>${renderInline('4', getDutyIndices("อาคาร 4"))}
<p class="level-1">อาคาร 5</p>${renderInline('4', getDutyIndices("อาคาร 5"))}
<p class="level-1">อาคาร 6</p>${renderInline('4', getDutyIndices("อาคาร 6"))}

<p class="bold level-0">5. ปฏิบัติหน้าที่อนุญาตนักเรียนที่มีความประสงค์ออกนอกโรงเรียน (ห้องปกครอง) ${dateStr}</p>
<p class="level-1">ช่วงกลางวัน เวลา 11.15 – 13.05 น.</p>${renderInline('5', getDutyIndices("อนุญาตออกนอก"))}

<p class="bold level-0">6. ปฏิบัติหน้าที่ตรวจความเรียบร้อยภายในบริเวณโรงเรียน รวมถึงห้องน้ำชาย/หญิง ${dateStr}</p>
<p class="level-1">ห้องน้ำชาย-หญิง หอประชุม ตึก 5 โรงอาหาร</p>${renderInline('6', getDutyIndices("หอประชุม/ตึก 5"))}
<p class="level-1">ห้องน้ำข้างตึก 1, 2, 3 และ 4</p>${renderInline('6', getDutyIndices("ข้างตึก 1-4"))}

<p class="bold level-0">7. ปฏิบัติหน้าที่ดูแลนักเรียนข้ามถนนหน้าโรงเรียนและตรวจความเรียบร้อยภายนอกบริเวณโรงเรียน ${dateStr}</p>
<p class="level-1">จุดที่ 1 ป้ายโรงเรียนใหม่</p>${renderInline('7', getDutyIndices("7.1 จราจรป้ายใหม่"))}
<p class="level-1">จุดที่ 2 ป้ายโรงเรียนเก่า</p>${renderInline('7', getDutyIndices("7.2 จราจรป้ายเก่า"))}

<p class="bold level-0">8. ปฏิบัติหน้าที่ตรวจสอบและดูแลนักเรียนมาสาย ${dateStr}</p>
<p class="level-1">ช่วงเช้า เวลา 08.10 – 08.30 น.</p>${renderInline('8', getDutyIndices("8.1 มาสาย"))}

<p class="bold level-0">9. ปฏิบัติหน้าที่อบรมนักเรียนหน้าลานธรรม ${dateStr}</p>
<p class="level-1">ช่วงเช้า เวลา 08.00 – 08.30 น.</p>${renderInline('9', getDutyIndices("9.1 ลานธรรม"))}

<br/><br/><table style="width: 100%; border: none;"><tr><td style="width: 55%; border: none;"></td><td style="text-align: center; border: none; font-size: 15pt;"><p>ลงชื่อ..........................................................</p><p>( ...................................................... )</p><p>หัวหน้าคณะสีชมพูคอยกำกับดูแล</p></td></tr></table>`;
                } else {
                    template = `<style>@font-face { font-family: 'TH Sarabun New'; } p, div, span, td { font-family: 'TH Sarabun New', sans-serif; font-size: 16pt; line-height: 1.15; margin: 0; } .bold { font-weight: bold; } .center { text-align: center; } .level-0 { margin-left: 0pt; } .level-1 { margin-left: 36pt; } </style>
<div class="center"><p class="bold" style="font-size: 18pt;">คำสั่งมอบหมายหน้าที่ปฏิบัติเวร${schoolName}</p><p class="bold" style="font-size: 16pt;">ประจำรอบที่ ${weekIdx + 1} (${dateStr})</p></div><br/>`;

                    duties.forEach((d, idx) => {
                        const assignedTeacher = n(idx);
                        template += `<p class="bold level-0">${idx + 1}. ${d.name}</p>
                        <p class="level-1">ผู้ปฏิบัติหน้าที่: <span class="bold">${assignedTeacher}</span></p>
                        <p class="level-1">ระดับภาระงาน: ${LEVEL_LABEL[d.level]}</p><br/>`;
                    });

                    template += `<br/><br/><table style="width: 100%; border: none;"><tr><td style="width: 55%; border: none;"></td><td style="text-align: center; border: none; font-size: 15pt;"><p>ลงชื่อ..........................................................</p><p>( ...................................................... )</p><p>หัวหน้าคณะสีชมพูคอยกำกับดูแล</p></td></tr></table>`;
                }
                
                const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>${template}</body></html>`;
                const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
                const url = URL.createObjectURL(blob); 
                const a = document.createElement('a'); 
                a.href = url; 
                a.download = `คำสั่งเวร_รอบที่${weekIdx + 1}.doc`; 
                a.click();
            };

            const highIndices = useMemo(() => duties.map((d, i) => d.level === "High" ? i : -1).filter(i => i !== -1), [duties]);
            const medIndices = useMemo(() => duties.map((d, i) => d.level === "Medium" ? i : -1).filter(i => i !== -1), [duties]);
            const stats = useMemo(() => {
                return getStatsForSchedule(masterSchedule, teachers.length, highIndices, medIndices);
            }, [masterSchedule, teachers, highIndices, medIndices]);

            if (loading) {
                return (
                    <div id="fallback-loader" style={{ display: "flex" }}>
                        <div className="spinner"></div>
                        <div style={{ fontSize: "16px", fontWeight: "500" }}>กำลังโหลดข้อมูลจากฐานข้อมูล...</div>
                    </div>
                );
            }

            return (
                <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                    <Sidebar 
                        active={active} 
                        setActive={setActive} 
                        collapsed={sidebarCollapsed} 
                        setCollapsed={setSidebarCollapsed}
                        schoolName={schoolName}
                        academicYear={academicYear}
                    />
                    <main className="main">
                        <Header 
                            active={active}
                            setActive={setActive}
                            onShuffle={handleShuffleAll} 
                            syncStatus={syncStatus} 
                            schoolName={schoolName}
                            academicYear={academicYear}
                        />
                        {active !== "home" && <KpiCards teachers={teachers} duties={duties} weekDates={weekDates} />}
                        
                        <div className="tab-content">
                            {active === "home" && (
                                <HomeMenu setActive={setActive} />
                            )}
                            {active === "overview" && (
                                <OverviewGrid 
                                    teachers={teachers} 
                                    duties={duties} 
                                    schedule={masterSchedule} 
                                />
                            )}
                            {active === "today" && (
                                <TodayInspectionTab 
                                    teachers={teachers} 
                                    duties={duties} 
                                    schedule={masterSchedule} 
                                    weekDates={weekDates} 
                                    attendance={attendance}
                                    onSaveAttendance={handleSaveAttendance}
                                />
                            )}
                            {active === "duty" && (
                                <DutyGrid 
                                    teachers={teachers} 
                                    duties={duties} 
                                    schedule={masterSchedule} 
                                />
                            )}
                            {active === "export" && (
                                <ExportTab 
                                    teachers={teachers} 
                                    duties={duties} 
                                    schedule={masterSchedule} 
                                    onExportWord={handleExportWord} 
                                    weekDates={weekDates}
                                    schoolName={schoolName}
                                />
                            )}
                            {active === "workload" && (
                                <WorkloadTab 
                                    teachers={teachers} 
                                    duties={duties} 
                                    schedule={masterSchedule} 
                                    quotaHigh={quotaHigh}
                                    quotaMedium={quotaMedium}
                                    quotaLow={quotaLow}
                                />
                            )}
                            {active === "teachers" && (
                                <TeachersList 
                                    teachers={teachers} 
                                    onAdd={handleAddTeacher}
                                    onEdit={handleEditTeacher}
                                    onDelete={handleDeleteTeacher}
                                    stats={stats}
                                />
                            )}
                            {active === "duties" && (
                                <DutiesList 
                                    duties={duties} 
                                    onAdd={handleAddDuty}
                                    onEdit={handleEditDuty}
                                    onDelete={handleDeleteDuty}
                                />
                            )}
                            {active === "settings" && (
                                <SettingsView 
                                    schoolName={schoolName}
                                    setSchoolName={setSchoolName}
                                    academicYear={academicYear}
                                    setAcademicYear={setAcademicYear}
                                    quotaHigh={quotaHigh}
                                    setQuotaHigh={setQuotaHigh}
                                    quotaMedium={quotaMedium}
                                    setQuotaMedium={setQuotaMedium}
                                    quotaLow={quotaLow}
                                    setQuotaLow={setQuotaLow}
                                    weekDates={weekDates}
                                    setWeekDates={setWeekDates}
                                    onSaveSettings={handleSaveSettings}
                                    onClearSchedule={handleClearSchedule}
                                    onResetDB={handleResetDB}
                                />
                            )}
                        </div>
                    </main>
                </div>
            );
        }

        // Render App
        const root = ReactDOM.createRoot(document.getElementById("root"));
        root.render(<App />);
    