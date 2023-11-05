GCSE Grade boundaries
**9** 84%
**8** 75%
**7** 67%
**6** 57%
**5** 49%
**4** 40%
**3** 29%
**2** 22%
**1** 8%
**U** 0 

A level with coursework
**A** 82%
**A** 72%
**B** 60%
**C** 48%
**D** 36%
**E** 25%

A level exam only
**A** 80%
**A** 70%
**B** 59%
**C** 47%
**D** 35%
**E** 23%

### 1.1.1 - Architecture of the CPU

#### a) The purpose of the CPU: The Fetch-Execute cycle
- **Fetch:** 
  - Retrieve the instruction from memory whose address is in the Program Counter (PC).
  - Increment the PC to point to the next instruction.
- **Decode:** 
  - Interpret the instruction to determine what operation is required.
- **Execute:** 
  - Carry out the operation, which may involve fetching more data from memory, performing some arithmetic or logic operation, or storing data back to memory.
- **Repeat:** 
  - The cycle repeats
    - Also, as the current instruction is executed the next instruction is being decoded and the following is being fetched at the same time. 

#### b) Common CPU components and their function: ALU, CU, Cache, Registers
- **Arithmetic Logic Unit (ALU):**
  - Performs arithmetic and logical operations.
- **Control Unit (CU):**
  - Manages the fetching, decoding, and execution of instructions. Controls and coordinates the activities of the other components of the computer.
- **Cache:**
  - Stores frequently used data to speed up the system by reducing the time it takes to access data from the main memory.
- **Registers:**
  - Small, fast storage areas within the CPU that hold data, instructions, or addresses during processing.

#### c) Von Neumann Architecture: MAR, MDR, Program Counter, Accumulator
- **Memory Address Register (MAR):**
  - Holds the address in memory of the instruction or data to be accessed (address).
- **Memory Data Register (MDR):**
  - Holds the data being transferred to or from memory (data).
- **Program Counter (PC):**
  - Holds the address of the next instruction to be executed (address).
- **Accumulator:**
  - Holds the results of calculations (data).
- **Features of Von Neumann Architecture:**
  - Data and instructions are stored in the same memory system.
  - Instructions and data are fetched from memory in a sequential manner.
  - Uses a single bus for data and instruction fetch, making it simpler but potentially slower due to the bottleneck created by the single bus.

### 1.1.2 - How common characteristics of CPUs affect their performance: Clock speed, Cache size, Number of cores

#### Clock Speed:
- **Definition:** 
   - The speed at which a CPU can execute instructions, typically measured in gigahertz (GHz).
- **Effects on Performance:**
   - Higher clock speed allows for more instructions to be executed per second, thus increasing the performance.
   - However, higher clock speed can also lead to increased heat generation which may require better cooling systems.

#### Cache Size:
- **Definition:**
   - The amount of on-board cache memory a CPU has for storing frequently accessed data and instructions, making them quickly available.
- **Effects on Performance:**
   - Larger cache size can significantly reduce the time it takes to access frequently used data, thus improving performance.
   - A larger cache can also reduce the dependency on the slower main RAM.

#### Number of Cores:
- **Definition:**
   - The number of independent processing units (cores) a CPU has, each capable of executing its own thread of instructions.
- **Effects on Performance:**
   - More cores allow for more parallel processing, which can significantly improve performance in multi-threaded applications or when multitasking.
   - However, the effectiveness of multiple cores can be limited by the software's ability to utilize them.

#### Combined Effects:
- **Clock Speed and Cache Size:**
   - A high clock speed combined with a large cache size can lead to very high performance as the CPU can execute instructions quickly and has quick access to frequently used data.
- **Clock Speed and Number of Cores:**
   - Higher clock speed and more cores can significantly improve performance in multi-threaded applications.
- **Cache Size and Number of Cores:**
   - A larger cache size can benefit multi-core CPUs by reducing the time each core spends waiting for data from the slower main memory.
- **All Three Characteristics:**
   - Optimizing all three characteristics can lead to a balanced and high-performing CPU. However, there are trade-offs such as increased power consumption and heat generation.

### 1.1.3 - Embedded Systems

#### a) The Purpose and Characteristics of Embedded Systems
- **Purpose:**
   - Embedded systems are specialized computing systems that do not look like computers. They are dedicated to specific tasks and "embed" as part of a larger device.
   - They control certain functions or features of the devices they are integrated into, often in real-time.

- **Characteristics:**
   - **Single-functioned:** Designed to perform a specific function.
   - **Tightly constrained:** Limited processing resources and memory.
   - **Real-time operation:** Must respond to inputs or events promptly.
   - **Integrated:** Embed within a larger device and controlled by a main processing core.
   - **Long lifecycle:** Often remain in use for many years after their development.

#### b) Examples of Embedded Systems
- **Automotive Controls:** Engine management systems, anti-lock braking systems, airbag systems, and on-board communications systems.
- **Home Appliances:** Microwave ovens, washing machines, and dishwashers.
- **Industrial Machines:** Programmable logic controllers (PLCs) and robotic assembly machines.
- **Consumer Electronics:** Smart TVs, video game consoles, and digital cameras.
- **Medical Devices:** Pacemakers, infusion pumps, and digital thermometers.
- **Networking Equipment:** Routers and switches.

### 1.2.2 - Secondary Storage

#### a) The Need for Secondary Storage
- Secondary storage is necessary to retain data and programs permanently, or when the computer is turned off. Unlike primary storage (RAM), which is volatile, secondary storage is non-volatile.
- It provides a way to store large amounts of data cost-effectively.
- It allows for the retrieval and sharing of data, and the installation of software that persists over time.

#### b) Common Types of Storage: Optical, Magnetic, Solid State
- **Optical Storage:**
  - Examples: CD, DVD, Blu-ray discs.
  - Data is read and written using laser technology.
- **Magnetic Storage:**
  - Examples: Hard Disk Drives (HDD), Magnetic Tape.
  - Data is read and written using magnetic fields.
- **Solid State Storage:**
  - Examples: Solid State Drives (SSD), USB flash drives.
  - Data is stored electronically with no moving parts.

#### c) Suitable Storage Devices and Storage Media for a Given Application
- **High-Speed Access:** SSDs for applications requiring fast data access like in gaming or high-performance computing.
- **Large Data Storage:** HDDs for storing large files or backups due to their higher capacity and lower cost per GB.
- **Portability:** USB flash drives or external SSDs for transferring data between different devices or locations.
- **Long-term Archiving:** Optical media or magnetic tape for archiving data as they can have a long shelf life.

#### d) Advantages and Disadvantages Relating to Characteristics: Capacity, Speed, Portability, Durability, Reliability, Cost
- **Optical Storage:**
   - Advantages: Durable, cost-effective, good for archiving.
   - Disadvantages: Lower capacity, slower speed, less convenient for frequent data rewriting.
- **Magnetic Storage (e.g., HDD):**
   - Advantages: High capacity, cost-effective for large data storage.
   - Disadvantages: Slower than SSDs, susceptible to physical damage due to moving parts.
- **Solid State Storage:**
   - Advantages: Fast access speed, more durable, reliable, and portable due to no moving parts.
   - Disadvantages: Higher cost per GB, lower capacity compared to HDDs at similar price points.

