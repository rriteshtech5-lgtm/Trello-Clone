import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  console.log("🌱 Starting database initialization...\n");

  try {
    // Get or create a sample user (using a demo ID)
    const demoUserId = "demo-user-001";

    // Create a sample board
    const { data: boardData, error: boardError } = await supabase
      .from("boards")
      .insert({
        title: "My First Board",
        description: "A sample Trello-style board",
        color: "bg-blue-500",
        user_id: demoUserId,
      })
      .select()
      .single();

    if (boardError) {
      console.error("Error creating board:", boardError);
      return;
    }

    const boardId = boardData.id;
    console.log("✅ Board created:", boardData.title);

    // Create sample columns
    const columns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    const { data: columnsData, error: columnsError } = await supabase
      .from("columns")
      .insert(
        columns.map((col) => ({
          ...col,
          board_id: boardId,
          user_id: demoUserId,
        }))
      )
      .select();

    if (columnsError) {
      console.error("Error creating columns:", columnsError);
      return;
    }

    console.log("✅ Columns created:", columnsData.length);

    // Create sample members
    const members = [
      {
        board_id: boardId,
        name: "John Doe",
        email: "john@example.com",
        color: "#ef4444",
        avatar_url: null,
      },
      {
        board_id: boardId,
        name: "Jane Smith",
        email: "jane@example.com",
        color: "#f97316",
        avatar_url: null,
      },
      {
        board_id: boardId,
        name: "Bob Johnson",
        email: "bob@example.com",
        color: "#eab308",
        avatar_url: null,
      },
    ];

    const { data: membersData, error: membersError } = await supabase
      .from("members")
      .insert(members)
      .select();

    if (membersError) {
      console.error("Error creating members:", membersError);
      return;
    }

    console.log("✅ Members created:", membersData.length);

    // Create sample labels
    const labels = [
      { board_id: boardId, name: "Bug", color: "#ef4444" },
      { board_id: boardId, name: "Feature", color: "#3b82f6" },
      { board_id: boardId, name: "Documentation", color: "#8b5cf6" },
      { board_id: boardId, name: "Question", color: "#ec4899" },
      { board_id: boardId, name: "Priority", color: "#f97316" },
    ];

    const { data: labelsData, error: labelsError } = await supabase
      .from("labels")
      .insert(labels)
      .select();

    if (labelsError) {
      console.error("Error creating labels:", labelsError);
      return;
    }

    console.log("✅ Labels created:", labelsData.length);

    // Create sample tasks
    const toDoColumn = columnsData.find((c: any) => c.title === "To Do");
    const inProgressColumn = columnsData.find((c: any) => c.title === "In Progress");
    const doneColumn = columnsData.find((c: any) => c.title === "Done");

    const tasks = [
      {
        column_id: toDoColumn.id,
        title: "Set up project structure",
        description: "Initialize the project with Next.js and configure base setup",
        priority: "high",
        sort_order: 0,
        due_date: "2025-04-15",
        assigned_member_id: membersData[0].id,
        is_archived: false,
      },
      {
        column_id: toDoColumn.id,
        title: "Design database schema",
        description: "Create comprehensive database design for all features",
        priority: "high",
        sort_order: 1,
        due_date: "2025-04-16",
        assigned_member_id: null,
        is_archived: false,
      },
      {
        column_id: inProgressColumn.id,
        title: "Implement authentication",
        description: "Set up user authentication with Clerk",
        priority: "high",
        sort_order: 0,
        due_date: "2025-04-10",
        assigned_member_id: membersData[1].id,
        is_archived: false,
      },
      {
        column_id: inProgressColumn.id,
        title: "Build drag and drop",
        description: "Implement dnd-kit for card and list movement",
        priority: "medium",
        sort_order: 1,
        due_date: "2025-04-12",
        assigned_member_id: membersData[2].id,
        is_archived: false,
      },
      {
        column_id: doneColumn.id,
        title: "Create UI components",
        description: "Build reusable React components with Radix UI",
        priority: "medium",
        sort_order: 0,
        due_date: "2025-04-05",
        assigned_member_id: membersData[0].id,
        is_archived: false,
      },
    ];

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .insert(tasks)
      .select();

    if (tasksError) {
      console.error("Error creating tasks:", tasksError);
      return;
    }

    console.log("✅ Tasks created:", tasksData.length);

    // Add labels to tasks
    if (tasksData && labelsData) {
      const cardLabelsMappings = [
        { taskIndex: 0, labelIndex: 1 }, // Feature
        { taskIndex: 1, labelIndex: 2 }, // Documentation
        { taskIndex: 2, labelIndex: 0 }, // Bug
        { taskIndex: 3, labelIndex: 1 }, // Feature
        { taskIndex: 4, labelIndex: 1 }, // Feature
      ];

      const cardLabels = cardLabelsMappings.map((mapping) => ({
        task_id: tasksData[mapping.taskIndex].id,
        label_id: labelsData[mapping.labelIndex].id,
      }));

      const { error: cardLabelsError } = await supabase
        .from("card_labels")
        .insert(cardLabels)
        .select();

      if (cardLabelsError) {
        console.error("Error adding labels to cards:", cardLabelsError);
        return;
      }

      console.log("✅ Card labels created:", cardLabels.length);
    }

    // Add checklist items to first task
    if (tasksData && tasksData.length > 0) {
      const checklistItems = [
        {
          task_id: tasksData[0].id,
          title: "Create folder structure",
          completed: true,
          sort_order: 0,
        },
        {
          task_id: tasksData[0].id,
          title: "Install dependencies",
          completed: true,
          sort_order: 1,
        },
        {
          task_id: tasksData[0].id,
          title: "Configure environment variables",
          completed: false,
          sort_order: 2,
        },
      ];

      const { error: checklistError } = await supabase
        .from("checklist_items")
        .insert(checklistItems)
        .select();

      if (checklistError) {
        console.error("Error creating checklist items:", checklistError);
        return;
      }

      console.log("✅ Checklist items created:", checklistItems.length);
    }

    console.log("\n🎉 Database initialization complete!");
    console.log(
      `\n📊 Summary:\n  - Board ID: ${boardId}\n  - User ID: ${demoUserId}\n  - Use this board for testing!\n`
    );
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});
