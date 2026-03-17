"use client";
import { useTheme } from "@/context/ThemeContext";

export default function LoadingPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 1024 1024"
            fill="none"
            className="animate-pulse"
          >
            <path d="M510,608 L587,531" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="108.89" strokeDashoffset="108.89">
              <animate attributeName="stroke-dashoffset" from="108.8944" to="0" begin="0.000s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M536,433 L583,486" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70.84" strokeDashoffset="70.84">
              <animate attributeName="stroke-dashoffset" from="70.8378" to="0" begin="0.040s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M428,531 L508,608" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="111.04" strokeDashoffset="111.04">
              <animate attributeName="stroke-dashoffset" from="111.0360" to="0" begin="0.080s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M509,405 L581,484" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="106.89" strokeDashoffset="106.89">
              <animate attributeName="stroke-dashoffset" from="106.8878" to="0" begin="0.120s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M431,489 L503,410" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="106.89" strokeDashoffset="106.89">
              <animate attributeName="stroke-dashoffset" from="106.8878" to="0" begin="0.160s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M441,479 L508,405" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="99.82" strokeDashoffset="99.82">
              <animate attributeName="stroke-dashoffset" from="99.8248" to="0" begin="0.200s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M573,590 L627,532" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="79.25" strokeDashoffset="79.25">
              <animate attributeName="stroke-dashoffset" from="79.2465" to="0" begin="0.240s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M396,533 L524,665" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="183.87" strokeDashoffset="183.87">
              <animate attributeName="stroke-dashoffset" from="183.8695" to="0" begin="0.280s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M397,487 L450,428" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="79.31" strokeDashoffset="79.31">
              <animate attributeName="stroke-dashoffset" from="79.3095" to="0" begin="0.320s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M566,419 L632,488" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="95.48" strokeDashoffset="95.48">
              <animate attributeName="stroke-dashoffset" from="95.4830" to="0" begin="0.360s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M423,559 L522,665" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="145.04" strokeDashoffset="145.04">
              <animate attributeName="stroke-dashoffset" from="145.0414" to="0" begin="0.400s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M497,346 L600,453" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="148.52" strokeDashoffset="148.52">
              <animate attributeName="stroke-dashoffset" from="148.5194" to="0" begin="0.440s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M572,665 L572,591" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="74.00" strokeDashoffset="74.00">
              <animate attributeName="stroke-dashoffset" from="74.0000" to="0" begin="0.480s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M451,428 L451,345" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="83.00" strokeDashoffset="83.00">
              <animate attributeName="stroke-dashoffset" from="83.0000" to="0" begin="0.520s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M302,491 L503,707" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="295.05" strokeDashoffset="295.05">
              <animate attributeName="stroke-dashoffset" from="295.0542" to="0" begin="0.560s" dur="0.050s" fill="freeze" />
            </path>
            <path d="M360,552 L491,692" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="191.73" strokeDashoffset="191.73">
              <animate attributeName="stroke-dashoffset" from="191.7316" to="0" begin="0.610s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M513,300 L721,523" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="304.95" strokeDashoffset="304.95">
              <animate attributeName="stroke-dashoffset" from="304.9475" to="0" begin="0.650s" dur="0.052s" fill="freeze" />
            </path>
            <path d="M599,391 L699,498" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="146.45" strokeDashoffset="146.45">
              <animate attributeName="stroke-dashoffset" from="146.4548" to="0" begin="0.702s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M614,608 L700,512" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="128.89" strokeDashoffset="128.89">
              <animate attributeName="stroke-dashoffset" from="128.8875" to="0" begin="0.742s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M614,606 L704,507" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="133.79" strokeDashoffset="133.79">
              <animate attributeName="stroke-dashoffset" from="133.7946" to="0" begin="0.782s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M324,505 L409,411" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="126.73" strokeDashoffset="126.73">
              <animate attributeName="stroke-dashoffset" from="126.7320" to="0" begin="0.822s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M321,510 L409,412" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="131.71" strokeDashoffset="131.71">
              <animate attributeName="stroke-dashoffset" from="131.7118" to="0" begin="0.862s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M350,579 L420,653" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="101.86" strokeDashoffset="101.86">
              <animate attributeName="stroke-dashoffset" from="101.8627" to="0" begin="0.902s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M513,301 L604,398" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="133.00" strokeDashoffset="133.00">
              <animate attributeName="stroke-dashoffset" from="133.0038" to="0" begin="0.942s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M616,642 L706,542" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="134.54" strokeDashoffset="134.54">
              <animate attributeName="stroke-dashoffset" from="134.5362" to="0" begin="0.982s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M578,339 L668,426" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="125.18" strokeDashoffset="125.18">
              <animate attributeName="stroke-dashoffset" from="125.1759" to="0" begin="1.022s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M333,458 L407,376" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="110.45" strokeDashoffset="110.45">
              <animate attributeName="stroke-dashoffset" from="110.4536" to="0" begin="1.062s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M573,333 L629,390" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="79.91" strokeDashoffset="79.91">
              <animate attributeName="stroke-dashoffset" from="79.9062" to="0" begin="1.102s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M240,560 L374,412" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="199.65" strokeDashoffset="199.65">
              <animate attributeName="stroke-dashoffset" from="199.6497" to="0" begin="1.142s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M342,634 L399,693" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="82.04" strokeDashoffset="82.04">
              <animate attributeName="stroke-dashoffset" from="82.0366" to="0" begin="1.182s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M655,600 L785,446" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="201.53" strokeDashoffset="201.53">
              <animate attributeName="stroke-dashoffset" from="201.5341" to="0" begin="1.222s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M513,272 L578,337" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="91.92" strokeDashoffset="91.92">
              <animate attributeName="stroke-dashoffset" from="91.9239" to="0" begin="1.262s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M401,632 L567,809" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="242.66" strokeDashoffset="242.66">
              <animate attributeName="stroke-dashoffset" from="242.6623" to="0" begin="1.302s" dur="0.041s" fill="freeze" />
            </path>
            <path d="M341,634 L444,741" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="148.52" strokeDashoffset="148.52">
              <animate attributeName="stroke-dashoffset" from="148.5194" to="0" begin="1.343s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M658,661 L756,548" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="149.58" strokeDashoffset="149.58">
              <animate attributeName="stroke-dashoffset" from="149.5761" to="0" begin="1.383s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M262,472 L378,347" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="170.53" strokeDashoffset="170.53">
              <animate attributeName="stroke-dashoffset" from="170.5315" to="0" begin="1.423s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M655,663 L787,511" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="201.32" strokeDashoffset="201.32">
              <animate attributeName="stroke-dashoffset" from="201.3157" to="0" begin="1.463s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M273,629 L344,576" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="88.60" strokeDashoffset="88.60">
              <animate attributeName="stroke-dashoffset" from="88.6002" to="0" begin="1.503s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M505,708 L734,708" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="229.00" strokeDashoffset="229.00">
              <animate attributeName="stroke-dashoffset" from="229.0000" to="0" begin="1.543s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M462,698 L539,778" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="111.04" strokeDashoffset="111.04">
              <animate attributeName="stroke-dashoffset" from="111.0360" to="0" begin="1.583s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M239,498 L328,402" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="130.91" strokeDashoffset="130.91">
              <animate attributeName="stroke-dashoffset" from="130.9084" to="0" begin="1.623s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M295,300 L512,300" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="217.00" strokeDashoffset="217.00">
              <animate attributeName="stroke-dashoffset" from="217.0000" to="0" begin="1.663s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M487,181 L676,377" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="272.28" strokeDashoffset="272.28">
              <animate attributeName="stroke-dashoffset" from="272.2811" to="0" begin="1.703s" dur="0.046s" fill="freeze" />
            </path>
            <path d="M241,652 L341,577" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="125.00" strokeDashoffset="125.00">
              <animate attributeName="stroke-dashoffset" from="125.0000" to="0" begin="1.749s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M677,429 L782,361" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="125.10" strokeDashoffset="125.10">
              <animate attributeName="stroke-dashoffset" from="125.0960" to="0" begin="1.789s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M674,430 L785,358" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="132.31" strokeDashoffset="132.31">
              <animate attributeName="stroke-dashoffset" from="132.3065" to="0" begin="1.829s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M399,695 L532,833" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="191.66" strokeDashoffset="191.66">
              <animate attributeName="stroke-dashoffset" from="191.6586" to="0" begin="1.869s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M267,688 L339,634" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="90.00" strokeDashoffset="90.00">
              <animate attributeName="stroke-dashoffset" from="90.0000" to="0" begin="1.909s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M654,665 L786,665" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="132.00" strokeDashoffset="132.00">
              <animate attributeName="stroke-dashoffset" from="132.0000" to="0" begin="1.949s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M677,377 L761,323" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="99.86" strokeDashoffset="99.86">
              <animate attributeName="stroke-dashoffset" from="99.8599" to="0" begin="1.989s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M240,345 L378,345" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="138.00" strokeDashoffset="138.00">
              <animate attributeName="stroke-dashoffset" from="138.0000" to="0" begin="2.029s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M432,730 L532,834" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="144.28" strokeDashoffset="144.28">
              <animate attributeName="stroke-dashoffset" from="144.2775" to="0" begin="2.069s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M239,474 L239,418" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="56.00" strokeDashoffset="56.00">
              <animate attributeName="stroke-dashoffset" from="56.0000" to="0" begin="2.109s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M300,711 L486,828" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="219.74" strokeDashoffset="219.74">
              <animate attributeName="stroke-dashoffset" from="219.7385" to="0" begin="2.149s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M569,811 L733,709" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="193.13" strokeDashoffset="193.13">
              <animate attributeName="stroke-dashoffset" from="193.1321" to="0" begin="2.189s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M572,810 L701,729" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="152.32" strokeDashoffset="152.32">
              <animate attributeName="stroke-dashoffset" from="152.3220" to="0" begin="2.229s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M268,690 L355,745" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="102.93" strokeDashoffset="102.93">
              <animate attributeName="stroke-dashoffset" from="102.9272" to="0" begin="2.269s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M239,652 L239,562" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="90.00" strokeDashoffset="90.00">
              <animate attributeName="stroke-dashoffset" from="90.0000" to="0" begin="2.309s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M357,748 L514,846" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="185.08" strokeDashoffset="185.08">
              <animate attributeName="stroke-dashoffset" from="185.0757" to="0" begin="2.349s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M786,446 L786,358" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="88.00" strokeDashoffset="88.00">
              <animate attributeName="stroke-dashoffset" from="88.0000" to="0" begin="2.389s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M295,298 L400,235" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="122.45" strokeDashoffset="122.45">
              <animate attributeName="stroke-dashoffset" from="122.4500" to="0" begin="2.429s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M513,166 L761,321" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="292.45" strokeDashoffset="292.45">
              <animate attributeName="stroke-dashoffset" from="292.4534" to="0" begin="2.469s" dur="0.050s" fill="freeze" />
            </path>
            <path d="M308,290 L449,205" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="164.64" strokeDashoffset="164.64">
              <animate attributeName="stroke-dashoffset" from="164.6390" to="0" begin="2.519s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M381,245 L447,205" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="77.18" strokeDashoffset="77.18">
              <animate attributeName="stroke-dashoffset" from="77.1751" to="0" begin="2.559s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M511,166 L659,258" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="174.26" strokeDashoffset="174.26">
              <animate attributeName="stroke-dashoffset" from="174.2642" to="0" begin="2.599s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M189,704 L189,304" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="400.00" strokeDashoffset="400.00">
              <animate attributeName="stroke-dashoffset" from="400.0000" to="0" begin="2.639s" dur="0.068s" fill="freeze" />
            </path>
            <path d="M835,704 L835,303" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="401.00" strokeDashoffset="401.00">
              <animate attributeName="stroke-dashoffset" from="401.0000" to="0" begin="2.707s" dur="0.068s" fill="freeze" />
            </path>
            <path d="M190,705 L515,908" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="383.19" strokeDashoffset="383.19">
              <animate attributeName="stroke-dashoffset" from="383.1892" to="0" begin="2.775s" dur="0.065s" fill="freeze" />
            </path>
            <path d="M190,704 L391,830" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="237.23" strokeDashoffset="237.23">
              <animate attributeName="stroke-dashoffset" from="237.2277" to="0" begin="2.840s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M666,812 L826,709" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="190.29" strokeDashoffset="190.29">
              <animate attributeName="stroke-dashoffset" from="190.2866" to="0" begin="2.880s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M516,908 L734,767" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="259.62" strokeDashoffset="259.62">
              <animate attributeName="stroke-dashoffset" from="259.6247" to="0" begin="2.920s" dur="0.044s" fill="freeze" />
            </path>
            <path d="M190,304 L505,108" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="371.00" strokeDashoffset="371.00">
              <animate attributeName="stroke-dashoffset" from="371.0000" to="0" begin="2.964s" dur="0.063s" fill="freeze" />
            </path>
            <path d="M191,303 L436,150" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="288.85" strokeDashoffset="288.85">
              <animate attributeName="stroke-dashoffset" from="288.8494" to="0" begin="3.027s" dur="0.049s" fill="freeze" />
            </path>
            <path d="M591,152 L834,303" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="286.09" strokeDashoffset="286.09">
              <animate attributeName="stroke-dashoffset" from="286.0944" to="0" begin="3.076s" dur="0.049s" fill="freeze" />
            </path>
            <path d="M751,758 L834,704" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="99.02" strokeDashoffset="99.02">
              <animate attributeName="stroke-dashoffset" from="99.0202" to="0" begin="3.125s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M519,108 L730,239" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="248.36" strokeDashoffset="248.36">
              <animate attributeName="stroke-dashoffset" from="248.3586" to="0" begin="3.165s" dur="0.042s" fill="freeze" />
            </path>
            <path d="M376,822 L514,908" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="162.60" strokeDashoffset="162.60">
              <animate attributeName="stroke-dashoffset" from="162.6038" to="0" begin="3.207s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M729,237 L834,302" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="123.49" strokeDashoffset="123.49">
              <animate attributeName="stroke-dashoffset" from="123.4909" to="0" begin="3.247s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M512,105 L616,169" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="122.11" strokeDashoffset="122.11">
              <animate attributeName="stroke-dashoffset" from="122.1147" to="0" begin="3.287s" dur="0.040s" fill="freeze" />
            </path>
            <path d="M414,165 L511,105" stroke={theme === 'dark' ? '#3b82f6' : '#1d4ed8'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="114.06" strokeDashoffset="114.06">
              <animate attributeName="stroke-dashoffset" from="114.0570" to="0" begin="3.327s" dur="0.040s" fill="freeze" />
            </path>
          </svg>
        </div>
        <h2 className={`text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Loading...
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Fetching Data From Portal
        </p>
      </div>
    </div>
  );
}