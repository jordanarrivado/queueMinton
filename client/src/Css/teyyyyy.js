app.put('/users/:userEmail/areas/:areaName/session/', async (req, res) => {
  const {userEmail, areaName } = req.params;
  const {mode, sessionCurrentDate } = req.body;

  try{
    const user = await UserModel.findOne({email:userEmail});
    if(!user){
      return res.status(404).send({error: 'User not found'});
    }
    const area = user.areas.find(area => area.name === areaName);
    if(!area){
     return res.status(404).send({error: 'Area not found'});
    }

    const newSession ={
      sessionDate: sessionCurrentDate,
      mode
    }
    area.sessions.push(newSession);

    await user.save();
    res.status(201).send(area.sessions[area.sessions.length - 1]);

  }catch (error) {
    console.error('Error adding session:', error);
    res.status(500).send({ error: 'Failed to add session' });
  }

});
